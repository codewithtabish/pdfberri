// src/components/icons/pdf-icons.tsx
// ============================================================
// Icons — PDFBerri
// Hand-rolled SVG icons for PDF tools, AI tools and UI.
// Thin-stroke style, all use `currentColor` so they follow
// your theme tokens (e.g. text-primary).
// ============================================================

import type { ReactNode, SVGProps } from "react";

type IconProps = {
  className?: string;
};

function Svg({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}


// ─── PASTE into @/components/general/icons/pdf-icons ───
// Skip any that already exist in that file. Needs: import type { SVGProps } from "react";
// (leave out the import if the file already has it)

export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2l2.2 6.3L20.5 10.5l-6.3 2.2L12 19l-2.2-6.3L3.5 10.5l6.3-2.2L12 2z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    </svg>
  );
}

export function UploadCloudIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20 46a12 12 0 01-1.6-23.9A15 15 0 0147.3 24 11 11 0 0146 46H20z"
        fill="currentColor"
      />
      <path
        d="M32 40V26m0 0l-6 6m6-6l6 6"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 3l7 3v5.5c0 4.3-2.9 7.9-7 9.5-4.1-1.6-7-5.2-7-9.5V6l7-3z" />
      <path d="M8.8 12.2l2.3 2.3 4.2-4.6" />
    </svg>
  );
}



export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.5l-5.8 3.1 1.1-6.4L2.6 9.6l6.5-.9L12 2.8z" />
    </svg>
  );
}



export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m15 6-6 6 6 6" />
    </Svg>
  );
}

// Shared document outline with folded corner
function Doc() {
  return (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
    </>
  );
}

// ============================================================
// ESSENTIAL PDF TOOLS
// ============================================================

export function MergeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="11" height="11" rx="2.5" />
      <rect x="10" y="10" width="11" height="11" rx="2.5" />
    </Svg>
  );
}

export function SplitIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.1 15.9" />
      <path d="M14.5 14.5 20 20" />
      <path d="M8.1 8.1 12 12" />
    </Svg>
  );
}

export function CompressIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3v6m0 0-3-3m3 3 3-3" />
      <path d="M12 21v-6m0 0-3 3m3-3 3 3" />
      <path d="M4 12h16" />
    </Svg>
  );
}

export function WordIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <Doc />
      <path d="M8 12.5 9.6 17l2.4-3.5 2.4 3.5 1.6-4.5" />
    </Svg>
  );
}

export function ExcelIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <Doc />
      <path d="m9 12.5 6 5M15 12.5l-6 5" />
    </Svg>
  );
}

export function PowerpointIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <Doc />
      <path d="M9.5 17.5v-5h3a1.8 1.8 0 0 1 0 3.6H9.5" />
    </Svg>
  );
}

export function PdfFileIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <Doc />
      <path d="M9 13h6M9 17h4" />
    </Svg>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m21 16-4.5-4.5L7 20" />
    </Svg>
  );
}

export function HtmlIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m14 5-4 14" />
    </Svg>
  );
}

// ============================================================
// EDITING
// ============================================================

export function EditIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </Svg>
  );
}

export function RotateIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </Svg>
  );
}

export function PageNumbersIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 9h14M5 15h14" />
      <path d="M10 4 8 20M16 4l-2 16" />
    </Svg>
  );
}

export function WatermarkIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.2 12 3 12 3Z" />
    </Svg>
  );
}

export function AnnotateIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4V5Z" />
      <path d="M8.5 8.5h7M8.5 12h4" />
    </Svg>
  );
}

export function SignIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 15c1.5-4 3-6 4.5-6s.5 5 2.5 5 2-3 3.5-3 1.5 2 3 2" />
      <path d="M3 20h18" />
    </Svg>
  );
}

// ============================================================
// SECURITY
// ============================================================

export function ProtectIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <path d="M12 15.5v2" />
    </Svg>
  );
}

export function UnlockIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V7a4 4 0 0 1 7.5-2" />
      <path d="M12 15.5v2" />
    </Svg>
  );
}

export function RedactIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <Doc />
      <rect x="8" y="12" width="8" height="3" rx="0.5" fill="currentColor" stroke="none" />
      <path d="M9 18h4" />
    </Svg>
  );
}


/**
 * PDFBerri — Tool Icons
 * Place this file at: src/components/general/icons/pdf-icons.tsx
 * (or adjust the import path to match your project)
 *
 * All icons are simple, consistent SVG components.
 * Colors inherit currentColor so they work with your theme.
 */



// ─── PASTE into @/components/general/icons/pdf-icons ───
// Skip any that already exist. SparkleIcon comes from the hero additions.
// Needs: import type { SVGProps } from "react";  (skip if already imported)

export function BerryLogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20 10c-8 0-13.5 6-13.5 13.2C6.5 31 12 36.5 20 36.5S33.5 31 33.5 23.2C33.5 16 28 10 20 10z"
        fill="#3B82F6"
      />
      <path
        d="M33.5 23.2C33.5 31 28 36.5 20 36.5c-4 0-7.4-1.4-9.7-3.8C13 34.8 16.3 35.5 20 35.5c7 0 12-4.8 12.5-12.3z"
        fill="#2563EB"
      />
      <ellipse cx="13.5" cy="20.5" rx="3" ry="4.5" transform="rotate(25 13.5 20.5)" fill="#fff" opacity=".35" />
      <path d="M20 10c-.5-3 1-6 4.5-7 .5 3-1 6-4.5 7z" fill="#22C55E" />
      <path d="M20 10c-2.5-2.5-6-2.5-8.5-1 1.5 3 5 4 8.5 1z" fill="#16A34A" />
      <path d="M20 10v-1" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}


// ─── PASTE into @/components/general/icons/pdf-icons ───

export function DevicesIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="2" y="4" width="13" height="10" rx="2" />
      <path d="M5.5 18h6M8.5 14v4" />
      <rect x="17" y="8" width="5" height="12" rx="1.5" />
      <path d="M19.5 17.5h.01" />
    </Svg>
  );
}

export function DiamondIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 3h12l4 6-10 12L2 9l4-6Z" />
      <path d="M2 9h20" />
      <path d="m8 9 4 12 4-12" />
      <path d="m9.5 3 2.5 6 2.5-6" />
    </Svg>
  );
}

export function GiftIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
      <path d="M12 8C10.5 5 7 4 6.5 6.5S9.5 8 12 8Z" />
      <path d="M12 8c1.5-3 5-4 5.5-1.5S14.5 8 12 8Z" />
    </Svg>
  );
}


// ─── PASTE into @/components/general/icons/pdf-icons ───

export function GlobeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
    </Svg>
  );
}

export function XSocialIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function GithubIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}


export function HeartIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 20s-7-4.4-9-9.2C1.8 7.6 3.6 4.5 6.8 4.5c2 0 3.5 1.1 5.2 3 1.7-1.9 3.2-3 5.2-3 3.2 0 5 3.1 3.8 6.3C19 15.6 12 20 12 20Z" />
    </Svg>
  );
}

export function PaletteIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-4-4-7.2-9-7.2Z" />
      <path d="M7.5 11h.01M10 7.5h.01M14.5 7.5h.01" />
    </Svg>
  );
}

export function HeadsetIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="4" height="6" rx="2" />
      <rect x="17" y="14" width="4" height="6" rx="2" />
      <path d="M20 20c0 1.1-1.8 2-4 2h-2" />
    </Svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </Svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  );
}


export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}



export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />
    </svg>
  );
}



function base(props: IconProps) {
  return {
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function HtmlToPdfIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 13l-2 2 2 2" />
      <path d="M14 13l2 2-2 2" />
    </svg>
  );
}

export function PdfToWordIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 15l1.5-4L12 15l1.5-4L15 15" />
    </svg>
  );
}

export function WordToPdfIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  );
}

export function PdfToExcelIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 13h6M9 17h6M12 13v4" />
    </svg>
  );
}

// ============================================================
// Annotate PDF — additional icons
// ============================================================

export function HighlighterIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m9 11-6 6v3h3l6-6" />
      <path d="m14 6 4-4 4 4-4 4" />
      <path d="m9 11 4 4 5-5-4-4" />
    </Svg>
  );
}

export function UnderlineIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 4v7a6 6 0 0 0 12 0V4" />
      <path d="M4 20h16" />
    </Svg>
  );
}

export function StrikethroughIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 12h16" />
      <path d="M16 6a4 4 0 0 0-8 0c0 2 2 3 4 3s4 1 4 3a4 4 0 0 1-8 0" />
    </Svg>
  );
}

export function PenIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m3 21 3-9 9-9 6 6-9 9-9 3Z" />
      <path d="m14 6 4 4" />
    </Svg>
  );
}

export function EraserIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m4 16 8-8 6 6-4 4H8l-4-4Z" />
      <path d="M20 20H10" />
    </Svg>
  );
}

export function TextIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 5h14" />
      <path d="M12 5v15" />
      <path d="M9 20h6" />
    </Svg>
  );
}

export function CommentIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
    </Svg>
  );
}

export function RectangleIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="4" y="6" width="16" height="12" rx="1.5" />
    </Svg>
  );
}

export function CircleShapeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8" />
    </Svg>
  );
}

export function ArrowShapeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 19 19 5" />
      <path d="M13 5h6v6" />
    </Svg>
  );
}

export function LineShapeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 19 19 5" />
    </Svg>
  );
}

export function UndoIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h11a5 5 0 0 1 0 10h-3" />
    </Svg>
  );
}

export function RedoIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m15 14 5-5-5-5" />
      <path d="M20 9H9a5 5 0 0 0 0 10h3" />
    </Svg>
  );
}

export function ZoomInIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.5-4.5" />
      <path d="M10.5 8v5M8 10.5h5" />
    </Svg>
  );
}

export function ZoomOutIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.5-4.5" />
      <path d="M8 10.5h5" />
    </Svg>
  );
}

export function FitWidthIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 12h18" />
      <path d="m7 8-4 4 4 4" />
      <path d="m17 8 4 4-4 4" />
    </Svg>
  );
}

export function FitPageIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9z" />
    </Svg>
  );
}

export function CursorIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m4 3 16 8-7 2-2 7-7-17Z" />
    </Svg>
  );
}

export function HandIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M10 11V4.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M13 11V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M16 11V7.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6v-3l-2.5-2.5a1.5 1.5 0 0 1 2-2L6 10" />
    </Svg>
  );
}

export function MoreHorizontalIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </Svg>
  );
}

export function FileIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
    </Svg>
  );
}

export function ExcelToPdfIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <rect x="8" y="12" width="8" height="6" rx="1" />
    </svg>
  );
}

export function JpgToPdfIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

export function PdfToJpgIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="10" cy="14" r="1.5" />
      <path d="M16 18l-2.5-3-2 2.5" />
    </svg>
  );
}

export function MergePdfIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 6h8M8 12h8M8 18h5" />
      <path d="M16 15l3 3-3 3" />
    </svg>
  );
}

export function SplitPdfIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 6h8M8 12h5M8 18h8" />
      <path d="M16 9l3 3-3 3" />
    </svg>
  );
}

export function CompressPdfIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M12 11v6M9 14l3 3 3-3" />
    </svg>
  );
}

export function ProtectPdfIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function RotatePdfIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M23 4v6h-6" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
  );
}




// ============================================================
// ORGANIZE / OCR
// ============================================================

export function OrganizeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

export function OcrIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 8V6a2 2 0 0 1 2-2h2" />
      <path d="M16 4h2a2 2 0 0 1 2 2v2" />
      <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
      <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
      <path d="M8 10h8M8 14h5" />
    </Svg>
  );
}

// ============================================================
// AI TOOLS
// ============================================================

export function ChatIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
    </Svg>
  );
}

export function SummarizeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 6h16M4 10h16M4 14h10M4 18h6" />
    </Svg>
  );
}

export function TranslateIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </Svg>
  );
}

export function NotesIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M9.5 8h5M9.5 12h5M9.5 16h3" />
    </Svg>
  );
}

export function QuizIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.5 9.5a2.6 2.6 0 0 1 5 1c0 1.7-2.5 2-2.5 3.5" />
      <path d="M12 17.5h.01" />
    </Svg>
  );
}

export function FlashcardIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="7" width="15" height="12" rx="2" />
      <path d="M6 7V6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1" />
    </Svg>
  );
}

export function DataExtractorIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </Svg>
  );
}

export function SparklesIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m11 3 1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9L11 3Z" />
      <path d="M19 3v4M17 5h4" />
    </Svg>
  );
}

// ============================================================
// UI HELPERS
// ============================================================

export function UploadIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 16V4m0 0-4 4m4-4 4 4" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </Svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 4v12m0 0-4-4m4 4 4-4" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </Svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.5-4.5" />
    </Svg>
  );
}


// ============================================================
// PDFBerri — Split PDF icon additions
// PASTE these into src/components/icons/pdf-icons.tsx
// (below the "UI HELPERS" section, above "BATCH EXPORT").
// They use the same Svg wrapper, 24x24 viewBox, 1.75 stroke and
// currentColor as the rest of the file. Skip any you already added
// while building Merge PDF (check for duplicate export names).
//
// Already in your file and reused by Split PDF:
//   SplitIcon, PdfFileIcon, UploadIcon, DownloadIcon, CheckIcon,
//   ChevronDownIcon, ArrowRightIcon, OrganizeIcon, ProtectIcon,
//   MergeIcon, CompressIcon, RotateIcon
// ============================================================

export function TrashIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="m6 7 1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M10 11v6M14 11v6" />
    </Svg>
  );
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 11a8 8 0 0 0-14.5-3.5L4 9" />
      <path d="M4 4v5h5" />
      <path d="M4 13a8 8 0 0 0 14.5 3.5L20 15" />
      <path d="M20 20v-5h-5" />
    </Svg>
  );
}

export function ZipIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <Doc />
      <path d="M11 8h2M11 11h2" />
      <path d="M10.5 14h3v3.5a1.5 1.5 0 0 1-3 0V14Z" />
    </Svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="m8 12.5 3 3 5-6" />
    </Svg>
  );
}

export function AlertCircleIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5v5" />
      <path d="M12 16.5h.01" />
    </Svg>
  );
}

export function LoaderIcon({ className }: IconProps) {
  // Add `animate-spin motion-reduce:animate-none` via className
  return (
    <Svg className={className}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </Svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function InfoIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 11v5.5" />
      <path d="M12 7.5h.01" />
    </Svg>
  );
}

export function ChevronUpIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m6 15 6-6 6 6" />
    </Svg>
  );
}

// Split method: "Extract selected pages"
export function PageSelectIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <Doc />
      <path d="m9 14.5 2 2 4-4" />
    </Svg>
  );
}

// Split method: "Split by page ranges"
export function PageRangeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </Svg>
  );
}

// Split method: "Extract every page"
export function MultiplePagesIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 7V5a2 2 0 0 1 2-2h6l4 4v8a2 2 0 0 1-2 2h-2" />
      <path d="M16 3v4h4" />
      <rect x="4" y="8" width="11" height="13" rx="2" />
    </Svg>
  );
}

// Feature: precise page selection
export function TargetIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </Svg>
  );
}

// Feature: flexible splitting
export function LayersIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </Svg>
  );
}

// Feature: easy / instant downloads
export function BoltIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </Svg>
  );
}


// ============================================================
// PDFBerri — Rotate PDF icon additions
// ============================================================

export function RotateCwIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8.9 6.5 2.5L21 8" />
      <path d="M21 3v5h-5" />
    </Svg>
  );
}

// ============================================================
// PDFBerri — Protect PDF icon additions
// ============================================================

export function EyeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function EyeOffIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2" />
      <path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    </Svg>
  );
}

export function KeyIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m10.7 12.3 9.8-9.8" />
      <path d="m16 7 3 3" />
    </Svg>
  );
}

export function SlidersIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 6h9M17 6h3" />
      <circle cx="15" cy="6" r="2" />
      <path d="M4 12h3M11 12h9" />
      <circle cx="9" cy="12" r="2" />
      <path d="M4 18h11M19 18h1" />
      <circle cx="17" cy="18" r="2" />
    </Svg>
  );
}

export function RotateCcwIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 12a9 9 0 1 0 9-9c-2.5 0-4.8.9-6.5 2.5L3 8" />
      <path d="M3 3v5h5" />
    </Svg>
  );
}

export function ServerIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="13" width="18" height="7" rx="2" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </Svg>
  );
}

// Add these to src/components/general/icons/pdf-icons.tsx if missing




export function BrowserIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M6.5 6.5h.01M9.5 6.5h.01" />
    </Svg>
  );
}
// ============================================================
// PDFBerri — PDF to Word icon additions
// ============================================================

export function SettingsIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 6h9M17 6h3" />
      <circle cx="15" cy="6" r="2" />
      <path d="M4 12h3M11 12h9" />
      <circle cx="9" cy="12" r="2" />
      <path d="M4 18h11M19 18h1" />
      <circle cx="17" cy="18" r="2" />
    </Svg>
  );
}


export function FolderOpenIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </Svg>
  );
}

export function CircleIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
    </Svg>
  );
}

export function BriefcaseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </Svg>
  );
}

export function GraduationCapIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m12 4 10 5-10 5L2 9l10-5Z" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
      <path d="M22 9v5" />
    </Svg>
  );
}

export function ContractIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <Doc />
      <path d="M8.5 12h7M8.5 15h4" />
      <path d="m13 18.5 1.2 1 2.3-2.5" />
    </Svg>
  );
}

export function ReceiptIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6" />
    </Svg>
  );
}

export function ChartBarIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 20v-7M11 20V5M17 20v-10" />
      <path d="M3 20h18" />
    </Svg>
  );
}

export function TextFileIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <Doc />
      <path d="M9 12h6M9 15h6M9 18h3" />
    </Svg>
  );
}
// ------------------------------------------------------------
// Also add these two lines to PDF_TOOL_ICONS (the "BATCH EXPORT" map):
//   "delete-pdf-pages": TrashIcon,
//   "rearrange-pdf-pages": OrganizeIcon,
// ------------------------------------------------------------

// ============================================================
// PDFBerri — Protect PDF icon additions
// ============================================================


// ============================================================
// Sign PDF — additional icons
// ============================================================

export function PenToolIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="m2 2 7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </Svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </Svg>
  );
}

export function ImagePlusIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
      <line x1="16" y1="5" x2="22" y2="5" />
      <line x1="19" y1="2" x2="19" y2="8" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </Svg>
  );
}


// BATCH EXPORT (for programmatic use, keyed by tool slug)
// ============================================================

export const PDF_TOOL_ICONS = {
  "merge-pdf": MergeIcon,
  "split-pdf": SplitIcon,
  "compress-pdf": CompressIcon,
  "pdf-to-word": WordIcon,
  "word-to-pdf": WordIcon,
  "pdf-to-excel": ExcelIcon,
  "excel-to-pdf": ExcelIcon,
  "pdf-to-powerpoint": PowerpointIcon,
  "powerpoint-to-pdf": PowerpointIcon,
  "pdf-to-jpg": ImageIcon,
  "jpg-to-pdf": ImageIcon,
  "html-to-pdf": HtmlIcon,
  "edit-pdf": EditIcon,
  "rotate-pdf": RotateIcon,
  "add-page-numbers": PageNumbersIcon,
  "add-watermark": WatermarkIcon,
  "annotate-pdf": AnnotateIcon,
  "sign-pdf": SignIcon,
  "protect-pdf": ProtectIcon,
  "unlock-pdf": UnlockIcon,
  "redact-pdf": RedactIcon,
  "organize-pdf": OrganizeIcon,
  "ocr-pdf": OcrIcon,
  "chat-with-pdf": ChatIcon,
  "summarize-pdf": SummarizeIcon,
  "translate-pdf": TranslateIcon,
  "notes-generator": NotesIcon,
  "quiz-generator": QuizIcon,
  "flashcard-generator": FlashcardIcon,
  "data-extractor": DataExtractorIcon,
} as const;

export type PdfToolIconKey = keyof typeof PDF_TOOL_ICONS;

