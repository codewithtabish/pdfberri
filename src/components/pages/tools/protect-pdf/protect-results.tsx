"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  CheckIcon,
  DownloadIcon,
  InfoIcon,
  LockIcon,
  PdfFileIcon,
  RefreshIcon,
} from "@/components/general/icons/pdf-icons";
import { ProtectButton } from "./protect-button";
import type { ProtectPdfResult } from "./protect-types";
import { formatFileSize, formatPageCount } from "./protect-utils";

interface ProtectResultsProps {
  result: ProtectPdfResult;
  downloaded: boolean;
  onDownload: () => void;
  onProtectAnother: () => void;
}

export function ProtectResults({ result, downloaded, onDownload, onProtectAnother }: ProtectResultsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const aes = result.verification.cipher === "aes-256";

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const checks = [
    "Opening requires the password",
    "An incorrect password is rejected",
    "The correct password opens the file",
    `Page count matches (${formatPageCount(result.pageCount)})`,
    result.verification.permissionsConfirmed
      ? "Permission settings confirmed in the file"
      : "Permission settings applied (not independently confirmed)",
  ];

  return (
    <section
      aria-labelledby="protect-result-heading"
      className="rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.07] p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg sm:size-16"
          >
            <CheckIcon className="size-8" />
          </motion.span>

          <div className="flex min-w-0 flex-col gap-2">
            <h2
              id="protect-result-heading"
              ref={headingRef}
              tabIndex={-1}
              className="text-xl font-extrabold tracking-tight text-foreground outline-none sm:text-2xl"
            >
              Your PDF is now protected.
            </h2>
            <p className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-foreground">
              <PdfFileIcon className="size-4 shrink-0 text-destructive" />
              <span className="min-w-0 truncate font-semibold" title={result.fileName}>
                {result.fileName}
              </span>
              <span className="font-mono text-xs text-muted-foreground">· {formatFileSize(result.sizeBytes)}</span>
            </p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <LockIcon className="size-4" />
              {aes ? "AES-256 encryption" : "Password-protected"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <ProtectButton size="lg" onClick={onDownload} className="w-full sm:w-auto">
            <DownloadIcon className="size-5" />
            {downloaded ? "Download Again" : "Download Protected PDF"}
          </ProtectButton>
          <ProtectButton size="lg" variant="outline" onClick={onProtectAnother} className="w-full sm:w-auto">
            <RefreshIcon className="size-5" />
            Protect Another PDF
          </ProtectButton>
        </div>
      </div>

      {downloaded ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 sm:p-4"
        >
          <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
          <div className="flex min-w-0 flex-col gap-0.5 text-sm">
            <p className="font-bold text-foreground">Downloaded successfully</p>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground break-all">{result.fileName}</span> was saved to your
              downloads folder. Open it with the password you set. The form and your passwords have been cleared.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 border-t border-emerald-500/20 pt-4 lg:grid-cols-2">
        <ul aria-label="Verification checks" className="flex flex-col gap-1.5 text-sm text-foreground">
          {checks.map((check) => (
            <li key={check} className="flex items-start gap-2">
              <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <span>{check}</span>
            </li>
          ))}
        </ul>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            Remember to store your password safely. PDFBerri cannot recover a forgotten password for you. Your original
            file was not modified.
          </span>
        </p>
      </div>
    </section>
  );
}