"use client";

import { useId } from "react";
import { InfoIcon, LoaderIcon, LockIcon } from "@/components/general/icons/pdf-icons";
import { ProtectButton } from "./protect-button";
import { ProtectFileCard } from "./protect-file-card";
import { ProtectPasswordInput } from "./protect-password-input";
import { ProtectPermissions } from "./protect-permissions";
import { ProtectStrengthMeter } from "./protect-strength-meter";
import type {
  ProtectPdfDocument,
  ProtectPdfPermissions,
  ProtectPdfStatus,
} from "./protect-types";
import {
  PASSWORD_ISSUE_MESSAGES,
  type PasswordStrength,
  type PasswordValidation,
} from "./protect-validation";

interface ProtectConfigurationProps {
  document: ProtectPdfDocument | null;
  status: ProtectPdfStatus;
  password: string;
  confirmPassword: string;
  existingPassword: string;
  existingPasswordRejected: boolean;
  permissions: ProtectPdfPermissions;
  validation: PasswordValidation;
  strength: PasswordStrength;
  showValidation: boolean;
  isProcessing: boolean;
  largeFile: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  onExistingChange: (value: string) => void;
  onTogglePermission: (key: keyof ProtectPdfPermissions) => void;
  onSubmit: () => void;
  onReplaceFiles: (files: File[]) => void;
  onRemove: () => void;
}

export function ProtectConfiguration({
  document: doc,
  status,
  password,
  confirmPassword,
  existingPassword,
  existingPasswordRejected,
  permissions,
  validation,
  strength,
  showValidation,
  isProcessing,
  largeFile,
  onPasswordChange,
  onConfirmChange,
  onExistingChange,
  onTogglePermission,
  onSubmit,
  onReplaceFiles,
  onRemove,
}: ProtectConfigurationProps) {
  const baseId = useId();
  const editable = status === "configuring" && doc !== null;

  const passwordIssue = validation.passwordIssue;
  const liveIssue = passwordIssue === "too-long" || passwordIssue === "control-characters";
  const showPasswordIssue = passwordIssue !== null && (showValidation || liveIssue);
  const confirmIssue = validation.confirmIssue;
  const showConfirmIssue =
    confirmIssue !== null && (showValidation || (confirmIssue === "mismatch" && confirmPassword.length > 0));
  const existingMissing = showValidation && Boolean(doc?.requiresExistingPassword) && existingPassword.length === 0;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex min-w-0 flex-col gap-5"
      aria-busy={isProcessing}
    >
      {doc ? (
        <ProtectFileCard document={doc} disabled={!editable} onReplace={onReplaceFiles} onRemove={onRemove} />
      ) : null}

      <div className="flex flex-col gap-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
          <LockIcon className="size-5 text-primary" />
          Password Protection
        </h3>

        {!doc ? (
          <p className="rounded-xl bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            Select a PDF to enable these settings.
          </p>
        ) : null}

        {doc?.requiresExistingPassword ? (
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-background/60 p-3">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              This PDF is already password-protected. Enter its current password so it can be re-protected with the new
              one.
            </p>
            <ProtectPasswordInput
              id={`${baseId}-existing`}
              label="Current PDF password"
              value={existingPassword}
              placeholder="Enter current password"
              autoComplete="current-password"
              disabled={!editable}
              invalid={existingPasswordRejected || existingMissing}
              errorMessage={
                existingPasswordRejected ? "That password doesn't open this PDF. Try again." : "Enter the current password."
              }
              onChange={onExistingChange}
            />
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <ProtectPasswordInput
              id={`${baseId}-password`}
              label="Open Password"
              value={password}
              placeholder="Enter password"
              autoComplete="new-password"
              disabled={!editable}
              invalid={showPasswordIssue}
              errorMessage={passwordIssue ? PASSWORD_ISSUE_MESSAGES[passwordIssue] : null}
              onChange={onPasswordChange}
            />
            <ProtectPasswordInput
              id={`${baseId}-confirm`}
              label="Confirm open password"
              hideLabel
              value={confirmPassword}
              placeholder="Confirm password"
              autoComplete="new-password"
              disabled={!editable}
              invalid={showConfirmIssue}
              errorMessage={confirmIssue ? PASSWORD_ISSUE_MESSAGES[confirmIssue] : null}
              onChange={onConfirmChange}
            />
          </div>
          <ProtectStrengthMeter strength={strength} />
        </div>
      </div>

      <ProtectPermissions permissions={permissions} disabled={!editable} onToggle={onTogglePermission} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span>Your original file remains unchanged.</span>
          {largeFile ? <span>Large files use more browser memory and may take longer.</span> : null}
        </div>
        <ProtectButton type="submit" size="lg" disabled={!editable} className="w-full sm:w-auto sm:min-w-44">
          {isProcessing ? (
            <>
              <LoaderIcon className="size-5 animate-spin motion-reduce:animate-none" />
              Protecting…
            </>
          ) : (
            <>
              <LockIcon className="size-5" />
              Protect PDF
            </>
          )}
        </ProtectButton>
      </div>
    </form>
  );
}