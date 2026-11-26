import { spawn } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { config } from "./config.js";
import { CancelledError, JobError } from "./errors.js";

const IS_WINDOWS = process.platform === "win32";

// Export hidden slides too: the master PDF then has exactly one page per slide,
// and the selection step decides what to keep.
const FILTER = 'pdf:impress_pdf_Export:{"ExportHiddenSlides":{"type":"boolean","value":"true"}}';

/** Kills soffice and everything it started, on Windows and Linux/macOS. */
function killTree(pid: number | undefined): void {
  if (!pid) return;
  try {
    if (IS_WINDOWS) {
      spawn("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }).on("error", () => undefined);
    } else {
      process.kill(-pid, "SIGKILL"); // negative pid = the whole process group
    }
  } catch {
    /* already gone */
  }
}

export async function convertToPdf(options: {
  dir: string;
  input: string;
  onSpawn: (kill: () => void) => void;
}): Promise<string> {
  const outDir = path.join(options.dir, "out");
  await mkdir(outDir, { recursive: true });
  const profileDir = path.join(options.dir, "profile");

  // Arguments are passed as an array (no shell) and the input has a generated name.
  const args = [
    "--headless",
    "--invisible",
    "--norestore",
    "--nolockcheck",
    "--nodefault",
    "--nologo",
    "--nofirststartwizard",
    `-env:UserInstallation=${pathToFileURL(profileDir).href}`,
    "--convert-to",
    FILTER,
    "--outdir",
    outDir,
    options.input,
  ];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(config.sofficeBin, args, {
      cwd: options.dir,
      detached: !IS_WINDOWS, // own process group on Linux/macOS so the whole tree can be killed
      windowsHide: true,
      stdio: "ignore",
      // Windows needs its normal environment (SystemRoot etc.), so keep it and only redirect temp folders.
      env: { ...process.env, TMPDIR: options.dir, TEMP: options.dir, TMP: options.dir, LANG: "C.UTF-8" },
    });

    let timedOut = false;
    let killedByUs = false;
    const kill = () => {
      killedByUs = true;
      killTree(child.pid);
    };
    options.onSpawn(kill);

    const timer = setTimeout(() => {
      timedOut = true;
      kill();
    }, config.convertTimeoutMs);

    child.on("error", () => {
      clearTimeout(timer);
      reject(new JobError("worker-unavailable"));
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      if (timedOut) return reject(new JobError("conversion-timeout"));
      if (killedByUs) return reject(new CancelledError());
      if (signal === "SIGKILL") return reject(new JobError("out-of-memory"));
      if (code !== 0) return reject(new JobError("conversion-failed"));
      resolve();
    });
  });

  const output = path.join(outDir, `${path.parse(options.input).name}.pdf`);
  try {
    if ((await stat(output)).size === 0) throw new Error("empty");
  } catch {
    // LibreOffice can exit 0 without writing output (e.g. password-protected legacy files).
    throw new JobError("conversion-failed");
  }
  return output;
}
