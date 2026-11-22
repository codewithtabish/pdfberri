import type { ProtectPdfErrorCode, ProtectPdfPermissions } from "./protect-types";

export const PROTECT_ROUTE = "/tools/protect-pdf";

/** Set NEXT_PUBLIC_SITE_URL in your env. Used for canonical + JSON-LD URLs. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfberri.com").replace(/\/+$/, "");

/** Tools index route (breadcrumb "PDF Tools" link + JSON-LD). */
export const TOOLS_INDEX_HREF = "/tools";

export const PROTECT_LIMITS = {
  maxFileSizeBytes: 100 * 1024 * 1024,
  largeFileWarningBytes: 50 * 1024 * 1024,
  minPasswordLength: 8,
  /** PDF 2.0 (AES-256) passwords are limited to 127 UTF-8 bytes. */
  maxPasswordBytes: 127,
  maxExistingPasswordLength: 1024,
} as const;

export const PROTECT_ENGINE_ASSETS = {
  worker: "/vendor/qpdf/protect-worker.js",
  core: "/vendor/qpdf/protect-qpdf-core.js",
} as const;

export const ENGINE_INIT_TIMEOUT_MS = 20_000;

export const DEFAULT_PERMISSIONS: ProtectPdfPermissions = {
  print: true,
  copy: true,
  edit: false,
  annotate: false,
};

export const PERMISSION_OPTIONS: ReadonlyArray<{ key: keyof ProtectPdfPermissions; label: string }> = [
  { key: "print", label: "Allow Printing" },
  { key: "edit", label: "Allow Editing" },
  { key: "copy", label: "Allow Copying Text" },
  { key: "annotate", label: "Allow Annotations" },
];

export const PROCESSING_STEPS = [
  "Preparing document",
  "Applying protection",
  "Verifying protected PDF",
  "Preparing download",
] as const;

export const ERROR_MESSAGES: Record<ProtectPdfErrorCode, { title: string; description: string }> = {
  "multiple-files": {
    title: "One PDF at a time",
    description: "Protect PDF works with a single file. Select one PDF to continue.",
  },
  "invalid-type": {
    title: "That isn't a PDF",
    description: "Select a file with the .pdf extension.",
  },
  "empty-file": {
    title: "This file is empty",
    description: "The selected file has no content. Choose a different PDF.",
  },
  "invalid-pdf": {
    title: "This doesn't look like a valid PDF",
    description: "The file doesn't have a PDF header, so it can't be processed. Choose a different file.",
  },
  "file-too-large": {
    title: "This file is too large",
    description: "Protect PDF supports files up to 100 MB in your browser. Try a smaller file.",
  },
  "file-unreadable": {
    title: "We couldn't read this file",
    description: "It may have been moved or deleted. Select the file again.",
  },
  corrupted: {
    title: "This PDF appears to be damaged",
    description: "We couldn't read the document structure. Try re-exporting the PDF, then select it again.",
  },
  "existing-restrictions": {
    title: "This PDF already has security restrictions",
    description:
      "It opens without a password but has permission restrictions applied. For safety, Protect PDF doesn't re-process documents that carry existing restrictions.",
  },
  "unsupported-encryption": {
    title: "Unsupported PDF encryption",
    description: "This PDF uses an encryption method that can't be processed here.",
  },
  "wrong-existing-password": {
    title: "Incorrect password",
    description: "That password doesn't open this PDF.",
  },
  "engine-init-failed": {
    title: "The protection engine couldn't start",
    description:
      "Your browser couldn't load the local encryption engine. Check your connection, reload the page and try again.",
  },
  "protect-failed": {
    title: "We couldn't protect this PDF",
    description: "Something went wrong while applying protection. Your original file wasn't changed. Please try again.",
  },
  "verification-failed": {
    title: "Protection couldn't be verified",
    description:
      "The protected file didn't pass our verification checks, so we haven't offered it for download. Your original file wasn't changed. Please try again.",
  },
  "out-of-memory": {
    title: "Not enough browser memory",
    description: "This document is too large for your browser to process. Close other tabs or try a smaller file.",
  },
  "download-failed": {
    title: "Download failed",
    description: "Your browser blocked the download. Try again, or allow downloads for this site.",
  },
  unknown: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Your original file wasn't changed. Please try again.",
  },
};

export const PRIVACY_POINTS = [
  "Protection runs locally in your browser. Your PDF and password are not uploaded to PDFBerri.",
  "Your original file is never modified. The protected copy is generated as a new file.",
  "Your password isn't saved or sent anywhere: not in URLs, filenames, storage, logs or error reports.",
] as const;

export const HOW_STEPS = [
  { title: "Upload your PDF", description: "Select the document you want to protect." },
  { title: "Create a strong password", description: "Choose and confirm an open password." },
  { title: "Apply password protection", description: "Encryption runs in your browser and is verified." },
  { title: "Download your protected document", description: "Save the new password-protected PDF." },
] as const;

export const PROTECT_FAQS = [
  {
    id: "how",
    question: "How do I password-protect a PDF?",
    answer:
      "Select your PDF, enter an open password and confirm it, choose optional permissions, then select Protect PDF. When processing and verification finish, download the new protected file.",
  },
  {
    id: "account",
    question: "Do I need an account to protect a PDF?",
    answer: "No. You can protect a PDF on this page without signing in.",
  },
  {
    id: "open-password",
    question: "What is an open password?",
    answer:
      "An open password is required to open and read the PDF. It is the main protection: the document content is encrypted with AES-256 and can't be read without it.",
  },
  {
    id: "permissions",
    question: "What is the difference between an open password and permissions?",
    answer:
      "The open password controls who can open the file. Permissions (printing, copying, editing, annotations) are flags that compliant PDF viewers may honor, but some viewers and tools ignore them. They are not a substitute for the open password.",
  },
  {
    id: "remove",
    question: "Can I remove the password later?",
    answer:
      "Yes, if you know the open password, you can open the file and save an unprotected copy in a PDF app that supports it. Restrictions you applied may need an owner password, which PDFBerri generates randomly and does not keep, so choose permissions carefully.",
  },
  {
    id: "mobile",
    question: "Can I protect a PDF on mobile?",
    answer:
      "Yes, in modern mobile browsers. Very large files may exceed your device's available memory, so smaller documents work best on phones.",
  },
  {
    id: "forgot",
    question: "Can I recover a forgotten PDF password?",
    answer:
      "No. PDFBerri doesn't store your password and the encryption can't be reversed without it. Keep it in a password manager or another safe place.",
  },
  {
    id: "upload",
    question: "Is my PDF uploaded to a server?",
    answer:
      "No. Encryption runs in your browser using a WebAssembly build of QPDF. Your file and password are not sent to PDFBerri. Only the engine code itself is downloaded when you use the tool.",
  },
] as const;

export const RELATED_TOOLS = [
  { href: "/tools/merge-pdf", title: "Merge PDF", description: "Combine multiple PDFs.", icon: "merge" },
  { href: "/tools/split-pdf", title: "Split PDF", description: "Extract pages or ranges.", icon: "split" },
  { href: "/tools/compress-pdf", title: "Compress PDF", description: "Reduce file size.", icon: "compress" },
  { href: "/tools/rotate-pdf", title: "Rotate PDF", description: "Rotate your PDF pages.", icon: "rotate" },
] as const;