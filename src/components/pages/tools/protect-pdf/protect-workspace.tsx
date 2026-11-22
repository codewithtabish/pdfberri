"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ProtectConfiguration } from "./protect-configuration";
import { ProtectError } from "./protect-error";
import { ProtectProgress } from "./protect-progress";
import { ProtectResults } from "./protect-results";
import { ProtectUploadZone } from "./protect-upload-zone";
import { useProtectWorkspace } from "./use-protect-workspace";

const PANEL_MOTION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28 },
} as const;

export function ProtectWorkspace() {
  const ws = useProtectWorkspace();
  const { state } = ws;

  return (
    <MotionConfig reducedMotion="user">
      <section id="protect-tool" aria-labelledby="protect-tool-heading" className="flex scroll-mt-24 flex-col gap-4 sm:gap-6">
        <h2 id="protect-tool-heading" className="sr-only">
          Protect your PDF
        </h2>

        <AnimatePresence initial={false}>
          {state.error ? (
            <motion.div key="error" {...PANEL_MOTION}>
              <ProtectError
                code={state.error}
                dismissLabel={state.document || state.result ? "Dismiss" : "Try again"}
                onDismiss={ws.dismissError}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="grid gap-4 rounded-3xl border border-border bg-card p-3 shadow-sm shadow-primary/5 sm:gap-6 sm:p-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <ProtectUploadZone
            status={state.status}
            hasDocument={state.document !== null}
            disabled={ws.isBusy}
            onSelect={ws.selectFiles}
          />
          <ProtectConfiguration
            document={state.document}
            status={state.status}
            password={state.password}
            confirmPassword={state.confirmPassword}
            existingPassword={state.existingPassword}
            existingPasswordRejected={state.existingPasswordRejected}
            permissions={state.permissions}
            validation={ws.validation}
            strength={ws.strength}
            showValidation={state.showValidation}
            isProcessing={state.protectRequested}
            largeFile={ws.largeFile}
            onPasswordChange={ws.setPassword}
            onConfirmChange={ws.setConfirmPassword}
            onExistingChange={ws.setExistingPassword}
            onTogglePermission={ws.togglePermission}
            onSubmit={ws.protect}
            onReplaceFiles={ws.selectFiles}
            onRemove={ws.reset}
          />
        </div>

        <AnimatePresence initial={false} mode="popLayout">
          {state.protectRequested ? (
            <motion.div key="progress" {...PANEL_MOTION}>
              <ProtectProgress status={state.status} />
            </motion.div>
          ) : null}
          {state.result ? (
            <motion.div key="result" {...PANEL_MOTION}>
              <ProtectResults
                result={state.result}
                downloaded={state.downloaded}
                onDownload={ws.download}
                onProtectAnother={ws.reset}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </MotionConfig>
  );
}