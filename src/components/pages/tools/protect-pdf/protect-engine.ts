
import {
  ENGINE_INIT_TIMEOUT_MS,
  PROTECT_ENGINE_ASSETS,
} from "./protect-config";

import {
  isProtectPdfErrorCode,
  ProtectPdfEngineError,
  type ProtectPdfEngine,
  type ProtectPdfErrorCode,
  type ProtectPdfInspectState,
  type ProtectPdfInspection,
  type ProtectPdfOptions,
  type ProtectPdfPermissions,
  type ProtectPdfVerification,
  type ProtectPdfVerifyParams,
} from "./protect-types";

import { hasPdfSignature } from "./protect-utils";

type CoreRequestType = "init" | "inspect" | "protect" | "verify";

type CoreFunction = (
  payload: Record<string, unknown>
) => Promise<unknown>;

type CoreApi = Record<CoreRequestType, CoreFunction>;

declare global {
  interface Window {
    PdfBerriQpdf?: CoreApi;
  }
}

interface Transport {
  readonly mode: "worker" | "main-thread";

  call<T>(
    type: CoreRequestType,
    payload: Record<string, unknown>,
    transfer?: Transferable[]
  ): Promise<T>;

  dispose(): void;
}

interface PendingCall {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

type WorkerResponse =
  | {
      id: number;
      ok: true;
      result: unknown;
    }
  | {
      id: number;
      ok: false;
      code?: unknown;
      message?: string;
    };

function normalizeCode(code: unknown): ProtectPdfErrorCode {
  if (code === "engine-failure") return "protect-failed";

  return isProtectPdfErrorCode(code) ? code : "unknown";
}

function logError(label: string, error: unknown): void {
  console.error(label, error);

  if (error instanceof Error) {
    console.error(`${label} Message:`, error.message);
    console.error(`${label} Stack:`, error.stack);
    console.error(
      `${label} Code:`,
      (error as Error & { code?: unknown }).code
    );
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new ProtectPdfEngineError("engine-init-failed"));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

class WorkerTransport implements Transport {
  readonly mode = "worker" as const;

  private worker: Worker | null;
  private nextId = 1;

  private readonly pending = new Map<number, PendingCall>();

  constructor(url: string) {
    const worker = new Worker(url);
    this.worker = worker;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const data = event.data;

      if (!data || typeof data.id !== "number") return;

      const entry = this.pending.get(data.id);

      if (!entry) return;

      this.pending.delete(data.id);

      if (data.ok) {
        entry.resolve(data.result);
      } else {
        console.error("[Protect PDF] Worker operation rejected:", {
          code: data.code,
          message: data.message,
        });

        entry.reject(
          new ProtectPdfEngineError(normalizeCode(data.code))
        );
      }
    };

    worker.onerror = (event: ErrorEvent) => {
      console.error("[Protect PDF] Worker runtime error:", {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
      });

      event.preventDefault();

      this.failAll("engine-init-failed");
    };

    worker.onmessageerror = (event: MessageEvent) => {
      console.error(
        "[Protect PDF] Worker message deserialization failed:",
        event
      );

      this.failAll("unknown");
    };
  }

  call<T>(
    type: CoreRequestType,
    payload: Record<string, unknown>,
    transfer: Transferable[] = []
  ): Promise<T> {
    const worker = this.worker;

    if (!worker) {
      return Promise.reject(
        new ProtectPdfEngineError("engine-init-failed")
      );
    }

    return new Promise<T>((resolve, reject) => {
      const id = this.nextId++;

      this.pending.set(id, {
        resolve: (value) => resolve(value as T),
        reject,
      });

      try {
        worker.postMessage(
          {
            id,
            type,
            payload,
          },
          transfer
        );
      } catch (error) {
        this.pending.delete(id);

        logError("[Protect PDF] Worker postMessage failed:", error);

        reject(new ProtectPdfEngineError("unknown"));
      }
    });
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;

    this.failAll("unknown");
  }

  private failAll(code: ProtectPdfErrorCode): void {
    for (const entry of this.pending.values()) {
      entry.reject(new ProtectPdfEngineError(code));
    }

    this.pending.clear();
  }
}

function loadCoreScript(): Promise<CoreApi> {
  return new Promise<CoreApi>((resolve, reject) => {
    if (window.PdfBerriQpdf) {
      resolve(window.PdfBerriQpdf);
      return;
    }

    const script = document.createElement("script");

    script.src = PROTECT_ENGINE_ASSETS.core;
    script.async = true;

    script.onload = () => {
      script.remove();

      if (window.PdfBerriQpdf) {
        resolve(window.PdfBerriQpdf);
      } else {
        const error = new Error(
          "QPDF script loaded, but PdfBerriQpdf was not registered on window."
        );

        logError("[Protect PDF] Core registration failed:", error);

        reject(new ProtectPdfEngineError("engine-init-failed"));
      }
    };

    script.onerror = (event) => {
      script.remove();

      console.error(
        "[Protect PDF] Failed to load core script:",
        PROTECT_ENGINE_ASSETS.core,
        event
      );

      reject(new ProtectPdfEngineError("engine-init-failed"));
    };

    document.head.appendChild(script);
  });
}

class MainThreadTransport implements Transport {
  readonly mode = "main-thread" as const;

  private constructor(private readonly core: CoreApi) {}

  static async create(): Promise<MainThreadTransport> {
    return new MainThreadTransport(await loadCoreScript());
  }

  async call<T>(
    type: CoreRequestType,
    payload: Record<string, unknown>
  ): Promise<T> {
    try {
      return (await this.core[type](payload)) as T;
    } catch (error) {
      logError(
        `[Protect PDF] Main-thread operation "${type}" failed:`,
        error
      );

      const code = (error as { code?: unknown } | null)?.code;

      throw new ProtectPdfEngineError(normalizeCode(code));
    }
  }

  dispose(): void {
    // No worker to terminate on the main thread.
  }
}

const INSPECT_STATES: readonly ProtectPdfInspectState[] = [
  "plain",
  "needs-password",
  "unlocked",
  "wrong-password",
  "restricted",
  "corrupt",
  "unsupported-encryption",
];

function parseInspection(raw: unknown): ProtectPdfInspection {
  const value = raw as
    | {
        state?: unknown;
        pageCount?: unknown;
      }
    | null;

  if (
    !value ||
    !INSPECT_STATES.includes(value.state as ProtectPdfInspectState)
  ) {
    throw new ProtectPdfEngineError("unknown");
  }

  const pageCount =
    typeof value.pageCount === "number" && value.pageCount > 0
      ? value.pageCount
      : null;

  return {
    state: value.state as ProtectPdfInspectState,
    pageCount,
  };
}

interface RawVerifyReport {
  passwordRequired?: unknown;
  wrongPasswordRejected?: unknown;
  correctPasswordOpens?: unknown;
  pageCount?: unknown;
  cipher?: unknown;
  permissions?: Partial<
    Record<keyof ProtectPdfPermissions, unknown>
  >;
}

export class LocalProtectEngine implements ProtectPdfEngine {
  private transport: Transport | null = null;
  private ready: Promise<void> | null = null;

  get mode(): "worker" | "main-thread" | null {
    return this.transport?.mode ?? null;
  }

  init(): Promise<void> {
    if (!this.ready) {
      this.ready = this.start().catch((error: unknown) => {
        this.ready = null;

        logError("[Protect PDF] Engine initialization failed:", error);

        throw error;
      });
    }

    return this.ready;
  }

  private async start(): Promise<void> {
    if (typeof Worker !== "undefined") {
      let workerTransport: WorkerTransport | null = null;

      try {
        console.info("[Protect PDF] Starting QPDF Web Worker...");

        workerTransport = new WorkerTransport(
          PROTECT_ENGINE_ASSETS.worker
        );

        await withTimeout(
          workerTransport.call("init", {}),
          ENGINE_INIT_TIMEOUT_MS
        );

        this.transport = workerTransport;

        console.info(
          "[Protect PDF] QPDF initialized successfully in Web Worker."
        );

        return;
      } catch (error) {
        logError(
          "[Protect PDF] Web Worker initialization failed. Trying main-thread fallback:",
          error
        );

        workerTransport?.dispose();
      }
    }

    let mainTransport: MainThreadTransport | null = null;

    try {
      console.info("[Protect PDF] Starting main-thread QPDF fallback...");

      mainTransport = await MainThreadTransport.create();

      await withTimeout(
        mainTransport.call("init", {}),
        ENGINE_INIT_TIMEOUT_MS
      );

      this.transport = mainTransport;

      console.info(
        "[Protect PDF] QPDF initialized successfully on the main thread."
      );
    } catch (error) {
      mainTransport?.dispose();

      logError(
        "[Protect PDF] Main-thread QPDF initialization failed:",
        error
      );

      throw new ProtectPdfEngineError("engine-init-failed");
    }
  }

  private async requireTransport(): Promise<Transport> {
    await this.init();

    if (!this.transport) {
      throw new ProtectPdfEngineError("engine-init-failed");
    }

    return this.transport;
  }

  async inspectDocument(
    bytes: ArrayBuffer,
    existingPassword?: string
  ): Promise<ProtectPdfInspection> {
    const transport = await this.requireTransport();

    const raw = await transport.call<unknown>(
      "inspect",
      {
        bytes,
        password: existingPassword,
      },
      [bytes]
    );

    return parseInspection(raw);
  }

  async protect(
    bytes: ArrayBuffer,
    options: ProtectPdfOptions
  ): Promise<ArrayBuffer> {
    const transport = await this.requireTransport();

    const raw = await transport.call<{
      bytes?: unknown;
    } | null>(
      "protect",
      {
        bytes,
        userPassword: options.userPassword,
        existingPassword: options.existingPassword,
        permissions: options.permissions,
      },
      [bytes]
    );

    if (
      !raw ||
      !(raw.bytes instanceof ArrayBuffer) ||
      raw.bytes.byteLength === 0
    ) {
      throw new ProtectPdfEngineError("protect-failed");
    }

    return raw.bytes;
  }

  async verifyProtectedOutput(
    bytes: ArrayBuffer,
    params: ProtectPdfVerifyParams
  ): Promise<ProtectPdfVerification> {
    if (
      bytes.byteLength === 0 ||
      !hasPdfSignature(
        new Uint8Array(
          bytes,
          0,
          Math.min(bytes.byteLength, 1030)
        )
      )
    ) {
      throw new ProtectPdfEngineError("verification-failed");
    }

    const transport = await this.requireTransport();

    const raw = await transport.call<RawVerifyReport | null>(
      "verify",
      {
        bytes,
        password: params.password,
      },
      [bytes]
    );

    if (!raw || typeof raw !== "object") {
      throw new ProtectPdfEngineError("verification-failed");
    }

    const checksPassed =
      raw.passwordRequired === true &&
      raw.wrongPasswordRejected === true &&
      raw.correctPasswordOpens === true &&
      raw.pageCount === params.expectedPageCount;

    let mismatch = false;
    let allKnown = true;

    const keys: Array<keyof ProtectPdfPermissions> = [
      "print",
      "copy",
      "edit",
      "annotate",
    ];

    for (const key of keys) {
      const actual = raw.permissions?.[key];

      if (typeof actual !== "boolean") {
        allKnown = false;
      } else if (actual !== params.permissions[key]) {
        mismatch = true;
      }
    }

    if (!checksPassed || mismatch) {
      throw new ProtectPdfEngineError("verification-failed");
    }

    return {
      cipher: raw.cipher === "aes-256" ? "aes-256" : "unconfirmed",
      permissionsConfirmed: allKnown,
    };
  }

  dispose(): void {
    this.transport?.dispose();
    this.transport = null;
    this.ready = null;
  }
}
