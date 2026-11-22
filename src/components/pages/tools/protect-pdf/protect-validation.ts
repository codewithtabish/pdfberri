import { PROTECT_LIMITS } from "./protect-config";
import { ProtectPdfEngineError } from "./protect-types";
import { hasPdfSignature, utf8ByteLength } from "./protect-utils";

/** Cheap checks on the main thread. Deep parsing happens in the engine. */
export async function validatePdfFile(file: File): Promise<void> {
  if (file.size === 0) throw new ProtectPdfEngineError("empty-file");

  const hasPdfName = /\.pdf$/i.test(file.name);
  const hasPdfMime = file.type === "application/pdf";
  if (!hasPdfName && !hasPdfMime) throw new ProtectPdfEngineError("invalid-type");

  if (file.size > PROTECT_LIMITS.maxFileSizeBytes) throw new ProtectPdfEngineError("file-too-large");

  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  if (!hasPdfSignature(head)) throw new ProtectPdfEngineError("invalid-pdf");
}

export type PasswordIssueCode =
  | "empty"
  | "control-characters"
  | "too-long"
  | "too-short"
  | "too-weak"
  | "confirm-empty"
  | "mismatch";

export const PASSWORD_ISSUE_MESSAGES: Record<PasswordIssueCode, string> = {
  empty: "Enter a password.",
  "control-characters": "Remove control characters from the password.",
  "too-long": `Use at most ${PROTECT_LIMITS.maxPasswordBytes} bytes (about ${PROTECT_LIMITS.maxPasswordBytes} basic characters).`,
  "too-short": `Use at least ${PROTECT_LIMITS.minPasswordLength} characters.`,
  "too-weak": "This password is too easy to guess. Try a longer, less predictable one.",
  "confirm-empty": "Confirm your password.",
  mismatch: "Passwords do not match.",
};

export interface PasswordValidation {
  passwordIssue: PasswordIssueCode | null;
  confirmIssue: PasswordIssueCode | null;
  isValid: boolean;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  hint: string;
  isEmpty: boolean;
}

// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F-\u009F]/;

const COMMON_PASSWORDS = new Set([
  "password", "passw0rd", "12345678", "123456789", "1234567890", "qwertyui", "qwerty123",
  "iloveyou", "admin123", "welcome1", "letmein1", "abc12345", "password1", "pdfberri",
  "protect", "secret123", "11111111", "00000000", "qwertyuiop", "baseball", "football",
]);

function isCommonPassword(password: string): boolean {
  const lower = password.toLowerCase();
  return COMMON_PASSWORDS.has(lower) || COMMON_PASSWORDS.has(lower.replace(/[^a-z]+$/, ""));
}

function longestSequentialRun(chars: string[]): number {
  let best = 1;
  let run = 1;
  let direction = 0;
  let previous: number | null = null;
  for (const char of chars) {
    const code = char.toLowerCase().codePointAt(0) ?? 0;
    if (previous !== null) {
      const diff = code - previous;
      if (diff === 1 || diff === -1) {
        run = direction === diff ? run + 1 : 2;
        direction = diff;
      } else {
        run = 1;
        direction = 0;
      }
      if (run > best) best = run;
    }
    previous = code;
  }
  return best;
}

function estimateEntropyBits(password: string): number {
  const chars = Array.from(password);
  const ascii = password.replace(/[\u0080-\uFFFF]/g, "");
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/\d/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(ascii)) pool += 33;
  if (/[\u0080-\uFFFF]/.test(password)) pool += 64;
  if (pool === 0) return 0;

  const unique = new Set(chars).size;
  const effectiveLength = Math.min(chars.length, unique * 1.5);
  let bits = effectiveLength * Math.log2(pool);
  if (longestSequentialRun(chars) >= 4) bits *= 0.7;
  if (/qwert|asdf|zxcv|1qaz|qazwsx/i.test(password)) bits *= 0.6;
  return bits;
}

const DEFAULT_HINT = "Use a long, unique password. A passphrase of several words works well.";

/** A transparent heuristic. It is an estimate, not a guarantee. */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const length = Array.from(password).length;
  if (length === 0) return { score: 0, label: "", hint: DEFAULT_HINT, isEmpty: true };

  if (isCommonPassword(password)) {
    return { score: 0, label: "Too weak", hint: "Avoid common passwords and predictable patterns.", isEmpty: false };
  }
  if (length < PROTECT_LIMITS.minPasswordLength) {
    return { score: 0, label: "Too weak", hint: `Use at least ${PROTECT_LIMITS.minPasswordLength} characters.`, isEmpty: false };
  }

  const bits = estimateEntropyBits(password);
  let score: 0 | 1 | 2 | 3 | 4 = bits >= 80 ? 4 : bits >= 62 ? 3 : bits >= 44 ? 2 : bits >= 28 ? 1 : 0;
  if (length < 10 && score > 2) score = 2;
  else if (length < 14 && score > 3) score = 3;

  const labels = ["Too weak", "Weak", "Fair", "Strong", "Very strong"] as const;
  const hint =
    score <= 1
      ? "Use 12 or more characters and avoid predictable patterns."
      : score === 2
        ? "Add length or mix character types to strengthen it."
        : "Looks good. Store it somewhere safe.";

  return { score, label: labels[score], hint, isEmpty: false };
}

export function validatePasswords(password: string, confirm: string): PasswordValidation {
  let passwordIssue: PasswordIssueCode | null = null;
  if (password.length === 0) passwordIssue = "empty";
  else if (CONTROL_CHARACTERS.test(password)) passwordIssue = "control-characters";
  else if (utf8ByteLength(password) > PROTECT_LIMITS.maxPasswordBytes) passwordIssue = "too-long";
  else if (Array.from(password).length < PROTECT_LIMITS.minPasswordLength) passwordIssue = "too-short";
  else if (evaluatePasswordStrength(password).score === 0) passwordIssue = "too-weak";

  let confirmIssue: PasswordIssueCode | null = null;
  if (confirm.length === 0) confirmIssue = "confirm-empty";
  else if (confirm !== password) confirmIssue = "mismatch";

  return { passwordIssue, confirmIssue, isValid: passwordIssue === null && confirmIssue === null };
}