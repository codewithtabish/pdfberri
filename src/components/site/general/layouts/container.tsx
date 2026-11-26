import * as React from "react";

import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Container — PDFBerri
 *
 * Public-site container only.
 *
 * Layout contract:
 *   - Passive wrapper: background, horizontal padding, ambient gradient.
 *   - Does NOT force min-height.
 *   - Does NOT create a flex column.
 *   - Ambient effects live inside an `absolute inset-0 overflow-hidden`
 *     overlay so they are clipped and cannot push the document height.
 *   - Content sits in its own z-10 wrapper so `sticky` and `fixed`
 *     positioning inside pages continue to work.
 *   - Content is centered and capped at max-w-7xl.
 *
 * Gradient strength is controlled by --glow-a / --glow-b / --glow-c
 * in globals.css (separate values for light and dark mode).
 */

// Layered brand-blue wash built only from the --primary token:
// a main glow at top-center, two side glows, and a soft vertical sky tint.
const TOP_WASH = [
  "radial-gradient(ellipse 70% 60% at 50% -5%, color-mix(in oklab, var(--primary) var(--glow-a), transparent), transparent 72%)",
  "radial-gradient(ellipse 45% 55% at 92% 10%, color-mix(in oklab, var(--primary) var(--glow-b), transparent), transparent 70%)",
  "radial-gradient(ellipse 40% 50% at 4% 24%, color-mix(in oklab, var(--primary) var(--glow-c), transparent), transparent 70%)",
  "linear-gradient(180deg, color-mix(in oklab, var(--primary) calc(var(--glow-c) * 0.6), transparent), transparent 65%)",
].join(", ");

// Fades the wash out toward the bottom so it never reaches content far below the hero.
const TOP_WASH_MASK = "linear-gradient(to bottom, black 60%, transparent 100%)";

const BOTTOM_GLOW =
  "radial-gradient(circle, color-mix(in oklab, var(--primary) var(--glow-c), transparent), transparent 70%)";

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        // ============================================================
        // BASE
        // ============================================================
        "relative isolate w-full",
        "bg-background text-foreground",
        "transition-colors duration-500 ease-out",

        // ============================================================
        // RESPONSIVE HORIZONTAL PADDING (reduced)
        // ============================================================
        "px-4", //     mobile → 16px
        "sm:px-6", //  sm     → 24px
        "lg:px-8", //  lg     → 32px

        className,
      )}
      {...props}
    >
      {/* ============================================================
          AMBIENT GRADIENT — clipped overlay
          ============================================================ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Top wash */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "900px",
            backgroundImage: TOP_WASH,
            maskImage: TOP_WASH_MASK,
            WebkitMaskImage: TOP_WASH_MASK,
          }}
        />

        {/* Bottom-right glow */}
        <div
          className="absolute bottom-[-20%] right-[-10%] size-87.5 rounded-full blur-[140px] sm:size-112.5 lg:size-150"
          style={{ backgroundImage: BOTTOM_GLOW }}
        />
      </div>

      {/* ============================================================
          CONTENT
          ============================================================ */}
      <div className="relative z-10 mx-auto w-full max-w-7xl">{children}</div>
    </div>
  );
}