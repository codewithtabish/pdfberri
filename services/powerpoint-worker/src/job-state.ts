export type JobState =
  | "queued"
  | "validating"
  | "inspecting"
  | "converting"
  | "verifying"
  | "ready"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

const ABORTS = ["failed", "cancelled", "expired"] as const;

const TRANSITIONS: Record<JobState, readonly JobState[]> = {
  queued: ["validating", ...ABORTS],
  validating: ["inspecting", ...ABORTS],
  inspecting: ["converting", ...ABORTS],
  converting: ["verifying", ...ABORTS],
  verifying: ["ready", ...ABORTS],
  ready: ["completed", ...ABORTS],
  completed: ["cancelled", "expired"],
  failed: [],
  cancelled: [],
  expired: [],
};

export function canTransition(from: JobState, to: JobState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: JobState, to: JobState): void {
  if (!canTransition(from, to)) throw new Error(`Invalid job transition: ${from} -> ${to}`);
}

export function isTerminal(state: JobState): boolean {
  return state === "failed" || state === "cancelled" || state === "expired";
}
