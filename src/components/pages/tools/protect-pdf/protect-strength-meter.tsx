"use client";

import { motion } from "framer-motion";
import { CheckCircleIcon, InfoIcon } from "@/components/general/icons/pdf-icons";
import { cn } from "@/lib/utils";
import type { PasswordStrength } from "./protect-validation";

const SEGMENT_COLORS = [
  "bg-destructive",
  "bg-orange-500",
  "bg-amber-400",
  "bg-lime-500",
  "bg-emerald-500",
] as const;

interface ProtectStrengthMeterProps {
  strength: PasswordStrength;
}

export function ProtectStrengthMeter({ strength }: ProtectStrengthMeterProps) {
  const filled = strength.isEmpty ? 0 : strength.score + 1;
  const good = !strength.isEmpty && strength.score >= 3;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Password Strength</p>
        <p aria-live="polite" className="text-sm font-semibold text-foreground">
          {strength.isEmpty ? <span className="text-muted-foreground">—</span> : strength.label}
        </p>
      </div>

      <div
        role="meter"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={strength.isEmpty ? 0 : strength.score}
        aria-valuetext={strength.isEmpty ? "No password entered" : strength.label}
        className="flex gap-1.5"
      >
        {SEGMENT_COLORS.map((color, index) => (
          <motion.span
            key={color}
            initial={false}
            animate={{ opacity: index < filled ? 1 : 0.4, scaleY: index < filled ? 1 : 0.85 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            className={cn("h-2 flex-1 rounded-full", index < filled ? SEGMENT_COLORS[strength.score] : "bg-muted")}
          />
        ))}
      </div>

      <div
        className={cn(
          "flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs leading-relaxed",
          good ? "bg-emerald-500/10 text-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {good ? (
          <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-emerald-500" />
        ) : (
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
        )}
        <span>{strength.hint}</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Strength is an estimate, not a guarantee. Passwords are used exactly as typed.
      </p>
    </div>
  );
}