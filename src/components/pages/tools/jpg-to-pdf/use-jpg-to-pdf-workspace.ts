"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { DEFAULT_SETTINGS } from "./jpg-to-pdf-config";
import { downloadBlob } from "./jpg-to-pdf-download";
import { ConversionCancelledError, createPdf } from "./jpg-to-pdf-engine";
import { isSwappedOrientation } from "./jpg-to-pdf-layout";
import type {
  ConversionProgress,
  ConversionResult,
  ConversionStatus,
  ImageItem,
  ImageRotation,
  PdfSettings,
  ValidationIssue,
} from "./jpg-to-pdf-types";
import { createId } from "./jpg-to-pdf-utils";
import { readImageHeader, validateFileBasics } from "./jpg-to-pdf-validation";

/**
 * Minimum time the loaders stay visible, so quick jobs do not flash by.
 * Progress values still come from real work. Change these to taste.
 */
export const MIN_CONVERSION_VISIBLE_MS = 1200;
export const MIN_READING_VISIBLE_MS = 600;

/** Resolves after `ms`, or immediately if the signal is aborted. */
function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (ms <= 0 || signal?.aborted) {
      resolve();
      return;
    }
    const timer = window.setTimeout(done, ms);
    function done() {
      window.clearTimeout(timer);
      signal?.removeEventListener("abort", done);
      resolve();
    }
    signal?.addEventListener("abort", done, { once: true });
  });
}

interface WorkspaceState {
  images: ImageItem[];
  settings: PdfSettings;
  status: ConversionStatus;
  issues: ValidationIssue[];
  isReading: boolean;
}

type Action =
  | { type: "reading"; value: boolean }
  | { type: "add"; images: ImageItem[]; issues: ValidationIssue[] }
  | { type: "remove"; id: string }
  | { type: "clear" }
  | { type: "reorder"; fromId: string; toId: string }
  | { type: "move"; id: string; offset: -1 | 1 }
  | { type: "rotate"; id: string }
  | { type: "settings"; patch: Partial<PdfSettings> }
  | { type: "start"; progress: ConversionProgress }
  | { type: "progress"; progress: ConversionProgress }
  | { type: "success"; result: ConversionResult }
  | { type: "failure"; message: string }
  | { type: "cancelled" }
  | { type: "dismiss-issues" }
  | { type: "add-issue"; issue: ValidationIssue };

const initialState: WorkspaceState = {
  images: [],
  settings: DEFAULT_SETTINGS,
  status: { phase: "idle" },
  issues: [],
  isReading: false,
};

/** A finished or failed result is stale once the inputs change. */
function resetStatus(status: ConversionStatus): ConversionStatus {
  return status.phase === "converting" ? status : { phase: "idle" };
}

function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  const busy = state.status.phase === "converting";
  switch (action.type) {
    case "reading":
      return { ...state, isReading: action.value };
    case "add":
      if (busy) return state;
      return {
        ...state,
        images: [...state.images, ...action.images],
        issues: action.issues,
        status: action.images.length ? resetStatus(state.status) : state.status,
      };
    case "remove":
      if (busy) return state;
      return {
        ...state,
        images: state.images.filter((image) => image.id !== action.id),
        status: resetStatus(state.status),
      };
    case "clear":
      if (busy) return state;
      return { ...state, images: [], issues: [], status: { phase: "idle" } };
    case "reorder": {
      if (busy || action.fromId === action.toId) return state;
      const from = state.images.findIndex((image) => image.id === action.fromId);
      const to = state.images.findIndex((image) => image.id === action.toId);
      if (from === -1 || to === -1) return state;
      const next = [...state.images];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...state, images: next, status: resetStatus(state.status) };
    }
    case "move": {
      if (busy) return state;
      const from = state.images.findIndex((image) => image.id === action.id);
      const to = from + action.offset;
      if (from === -1 || to < 0 || to >= state.images.length) return state;
      const next = [...state.images];
      [next[from], next[to]] = [next[to], next[from]];
      return { ...state, images: next, status: resetStatus(state.status) };
    }
    case "rotate":
      if (busy) return state;
      return {
        ...state,
        images: state.images.map((image) =>
          image.id === action.id
            ? { ...image, rotation: (((image.rotation + 90) % 360) as ImageRotation) }
            : image,
        ),
        status: resetStatus(state.status),
      };
    case "settings":
      if (busy) return state;
      return {
        ...state,
        settings: { ...state.settings, ...action.patch },
        status: resetStatus(state.status),
      };
    case "start":
      return { ...state, issues: [], status: { phase: "converting", progress: action.progress } };
    case "progress":
      if (!busy) return state;
      return { ...state, status: { phase: "converting", progress: action.progress } };
    case "success":
      return { ...state, status: { phase: "success", result: action.result } };
    case "failure":
      return { ...state, status: { phase: "error", message: action.message } };
    case "cancelled":
      return { ...state, status: { phase: "idle" } };
    case "dismiss-issues":
      return { ...state, issues: [] };
    case "add-issue":
      return { ...state, issues: [...state.issues, action.issue] };
    default:
      return state;
  }
}

export function useJpgToPdfWorkspace() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Latest state for callbacks that must not be re-created on every change.
  const stateRef = useRef(state);
  const imagesRef = useRef<ImageItem[]>(state.images);
  const urlsRef = useRef<Map<string, string>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const readingRef = useRef(false);

  // Keep refs current and revoke preview URLs of removed images.
  useEffect(() => {
    stateRef.current = state;
    imagesRef.current = state.images;
    const alive = new Set(state.images.map((image) => image.id));
    for (const [id, url] of urlsRef.current) {
      if (!alive.has(id)) {
        URL.revokeObjectURL(url);
        urlsRef.current.delete(id);
      }
    }
  }, [state]);

  useEffect(() => {
    mountedRef.current = true;
    const urls = urlsRef.current;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  const addFiles = useCallback(async (input: FileList | File[]) => {
    const files = Array.from(input);
    if (files.length === 0 || readingRef.current || abortRef.current) return;
    readingRef.current = true;
    dispatch({ type: "reading", value: true });
    const startedAt = Date.now();

    let count = imagesRef.current.length;
    let bytes = imagesRef.current.reduce((sum, image) => sum + image.size, 0);
    const accepted: ImageItem[] = [];
    const issues: ValidationIssue[] = [];

    try {
      for (const file of files) {
        const problem = validateFileBasics(file, count, bytes);
        if (problem) {
          issues.push({ fileName: file.name, message: problem });
          continue;
        }
        try {
          const header = await readImageHeader(file);
          const swapped = isSwappedOrientation(header.exifOrientation);
          const id = createId();
          const previewUrl = URL.createObjectURL(file);
          urlsRef.current.set(id, previewUrl);
          accepted.push({
            ...header,
            id,
            file,
            name: file.name,
            size: file.size,
            displayWidth: swapped ? header.height : header.width,
            displayHeight: swapped ? header.width : header.height,
            rotation: 0,
            previewUrl,
          });
          count += 1;
          bytes += file.size;
        } catch (error) {
          issues.push({
            fileName: file.name,
            message: error instanceof Error ? error.message : "This file could not be read.",
          });
        }
      }

      // Keep the loader visible long enough to be noticed.
      await wait(MIN_READING_VISIBLE_MS - (Date.now() - startedAt));
    } finally {
      readingRef.current = false;
    }

    if (!mountedRef.current) {
      for (const image of accepted) {
        const url = urlsRef.current.get(image.id);
        if (url) URL.revokeObjectURL(url);
        urlsRef.current.delete(image.id);
      }
      return;
    }
    dispatch({ type: "add", images: accepted, issues });
    dispatch({ type: "reading", value: false });
  }, []);

  const convert = useCallback(async () => {
    if (abortRef.current) return;
    const images = imagesRef.current;
    if (images.length === 0) return;

    const controller = new AbortController();
    abortRef.current = controller;
    const startedAt = Date.now();
    dispatch({
      type: "start",
      progress: { stage: "preparing", current: 0, total: images.length, fileName: null, fraction: 0 },
    });

    try {
      const result = await createPdf(images, stateRef.current.settings, {
        signal: controller.signal,
        onProgress: (progress) => {
          if (mountedRef.current && abortRef.current === controller) {
            dispatch({ type: "progress", progress });
          }
        },
      });

      // Keep the loader visible long enough to be noticed, then show the result.
      await wait(MIN_CONVERSION_VISIBLE_MS - (Date.now() - startedAt), controller.signal);
      if (controller.signal.aborted) throw new ConversionCancelledError();
      if (mountedRef.current) dispatch({ type: "success", result });
    } catch (error) {
      if (!mountedRef.current) return;
      if (error instanceof ConversionCancelledError) {
        dispatch({ type: "cancelled" });
      } else {
        dispatch({
          type: "failure",
          message:
            error instanceof Error && error.message
              ? error.message
              : "Something went wrong while creating the PDF. Please try again.",
        });
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const download = useCallback(() => {
    const { status } = stateRef.current;
    if (status.phase !== "success") return;
    try {
      downloadBlob(status.result.blob, status.result.fileName);
    } catch {
      dispatch({
        type: "add-issue",
        issue: {
          fileName: status.result.fileName,
          message: "The download could not be started. Please try again.",
        },
      });
    }
  }, []);

  return {
    state,
    addFiles,
    convert,
    cancel,
    download,
    removeImage: useCallback((id: string) => dispatch({ type: "remove", id }), []),
    clearImages: useCallback(() => dispatch({ type: "clear" }), []),
    reorderImages: useCallback(
      (fromId: string, toId: string) => dispatch({ type: "reorder", fromId, toId }),
      [],
    ),
    moveImage: useCallback(
      (id: string, offset: -1 | 1) => dispatch({ type: "move", id, offset }),
      [],
    ),
    rotateImage: useCallback((id: string) => dispatch({ type: "rotate", id }), []),
    updateSettings: useCallback(
      (patch: Partial<PdfSettings>) => dispatch({ type: "settings", patch }),
      [],
    ),
    dismissIssues: useCallback(() => dispatch({ type: "dismiss-issues" }), []),
  };
}