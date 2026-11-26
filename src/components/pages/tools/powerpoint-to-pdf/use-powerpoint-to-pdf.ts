"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  deleteJob,
  finalizeJob,
  getDownloadUrl,
  getJobStatus,
  PptApiError,
  uploadPresentation,
} from "./powerpoint-to-pdf-api";
import {
  DEFAULT_SETTINGS,
  POLL_INTERVAL_MS,
  POLL_MAX_TRANSIENT_FAILURES,
} from "./powerpoint-to-pdf-constants";
import { getErrorMessage } from "./powerpoint-to-pdf-errors";
import type {
  PptErrorCode,
  PptJobStatus,
  PptSettings,
  WorkspaceError,
} from "./powerpoint-to-pdf-types";
import { isAbortError, sleep } from "./powerpoint-to-pdf-utils";
import { validatePowerPointFile, validateSettings } from "./powerpoint-to-pdf-validation";

export type Phase =
  | "idle"
  | "uploading"
  | "processing"
  | "ready"
  | "finalizing"
  | "completed"
  | "failed";

interface State {
  phase: Phase;
  file: File | null;
  uploadPercent: number;
  job: PptJobStatus | null;
  error: WorkspaceError | null;
  settings: PptSettings;
  resultVersion: number;
}

const INITIAL: State = {
  phase: "idle",
  file: null,
  uploadPercent: 0,
  job: null,
  error: null,
  settings: DEFAULT_SETTINGS,
  resultVersion: 0,
};

const FATAL_FINALIZE_CODES: PptErrorCode[] = ["not-found", "expired", "cancelled"];

function toCode(error: unknown): PptErrorCode {
  return error instanceof PptApiError ? error.code : "internal";
}

export function usePowerPointToPdf() {
  const [state, setState] = useState<State>(INITIAL);
  const jobIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const runRef = useRef(0);

  const discardJob = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    const id = jobIdRef.current;
    jobIdRef.current = null;
    if (id) void deleteJob(id);
  }, []);

  useEffect(() => {
    const onPageHide = () => discardJob();
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      runRef.current++;
      discardJob();
    };
  }, [discardJob]);

  const failWith = useCallback((code: PptErrorCode, runId: number) => {
    if (runId !== runRef.current) return;
    setState((s) => ({ ...s, phase: "failed", error: { code, message: getErrorMessage(code) } }));
  }, []);

  const poll = useCallback(
    async (jobId: string, runId: number, signal: AbortSignal) => {
      let transient = 0;
      while (!signal.aborted && runId === runRef.current) {
        let job: PptJobStatus;
        try {
          job = await getJobStatus(jobId, signal);
          transient = 0;
        } catch (error) {
          if (isAbortError(error)) return;
          if (error instanceof PptApiError && error.code === "network" && ++transient <= POLL_MAX_TRANSIENT_FAILURES) {
            await sleep(POLL_INTERVAL_MS * 2, signal).catch(() => undefined);
            continue;
          }
          failWith(toCode(error), runId);
          return;
        }
        if (runId !== runRef.current) return;
        setState((s) => ({ ...s, job }));

        if (job.state === "ready") {
          setState((s) => ({ ...s, phase: "ready" }));
          return;
        }
        if (job.state === "failed" || job.state === "cancelled" || job.state === "expired") {
          failWith(
            job.errorCode ??
              (job.state === "expired" ? "expired" : job.state === "cancelled" ? "cancelled" : "conversion-failed"),
            runId,
          );
          return;
        }
        try {
          await sleep(POLL_INTERVAL_MS, signal);
        } catch {
          return;
        }
      }
    },
    [failWith],
  );

  const selectFile = useCallback(
    async (file: File) => {
      discardJob();
      const runId = ++runRef.current;

      const validation = await validatePowerPointFile(file);
      if (runId !== runRef.current) return;
      if (!validation.ok) {
        setState((s) => ({
          ...INITIAL,
          settings: s.settings,
          file,
          phase: "failed",
          error: { code: validation.code, message: getErrorMessage(validation.code) },
        }));
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setState((s) => ({ ...INITIAL, settings: DEFAULT_SETTINGS, file, phase: "uploading", resultVersion: s.resultVersion }));

      try {
        const jobId = await uploadPresentation(file, {
          signal: controller.signal,
          onProgress: (uploadPercent) => {
            if (runId === runRef.current) setState((s) => ({ ...s, uploadPercent }));
          },
        });
        if (runId !== runRef.current) {
          void deleteJob(jobId);
          return;
        }
        jobIdRef.current = jobId;
        setState((s) => ({ ...s, phase: "processing", uploadPercent: 100 }));
        await poll(jobId, runId, controller.signal);
      } catch (error) {
        if (isAbortError(error)) return;
        failWith(toCode(error), runId);
      }
    },
    [discardJob, failWith, poll],
  );

  const removeFile = useCallback(() => {
    runRef.current++;
    discardJob();
    setState((s) => ({ ...INITIAL, resultVersion: s.resultVersion }));
  }, [discardJob]);

  const updateSettings = useCallback((patch: Partial<PptSettings>) => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, ...patch },
      // Changing settings after a conversion makes the previous PDF stale.
      phase: s.phase === "completed" ? "ready" : s.phase,
      error: s.phase === "ready" || s.phase === "completed" ? null : s.error,
    }));
  }, []);

  const settingsValidation = useMemo(
    () => (state.job?.slideCount != null ? validateSettings(state.settings, state.job.slideCount) : null),
    [state.job?.slideCount, state.settings],
  );

  const convert = useCallback(async () => {
    const jobId = jobIdRef.current;
    if (!jobId || !settingsValidation?.ok) return;
    const runId = runRef.current;

    setState((s) => ({ ...s, phase: "finalizing", error: null }));
    try {
      const job = await finalizeJob(jobId, settingsValidation.request);
      if (runId !== runRef.current) return;
      setState((s) => ({ ...s, job, phase: "completed", resultVersion: s.resultVersion + 1 }));
    } catch (error) {
      if (runId !== runRef.current) return;
      const code = toCode(error);
      if (FATAL_FINALIZE_CODES.includes(code)) return failWith(code, runId);
      setState((s) => ({ ...s, phase: "ready", error: { code, message: getErrorMessage(code) } }));
    }
  }, [settingsValidation, failWith]);

  return {
    state,
    settingsValidation,
    selectFile,
    removeFile,
    updateSettings,
    convert,
    downloadUrl: state.job ? getDownloadUrl(state.job.id) : null,
  };
}
