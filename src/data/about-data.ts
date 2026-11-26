import {
  Accessibility,
  RefreshCw,
  ShieldCheck,
  Star,
  ThumbsUp,
  Zap,
  type LucideIcon,
} from "lucide-react";

// TODO: only keep numbers that are true today.
export const STATS = [
  { value: "50M+", label: "files processed" },
  { value: "30+", label: "tools" },
  { value: "180+", label: "countries" },
  { value: "99.9%", label: "uptime" },
];

export const VALUES: {
  icon: LucideIcon;
  title: string;
  text: string;
}[] = [
  { icon: ShieldCheck, title: "Privacy first", text: "Your files are safe with auto-delete." },
  { icon: Zap, title: "Speed", text: "Get results in seconds." },
  { icon: ThumbsUp, title: "Simplicity", text: "Powerful tools, easy to use." },
  { icon: Star, title: "Quality", text: "High-quality output, every time." },
  { icon: Accessibility, title: "Accessibility", text: "For everyone, everywhere." },
  { icon: RefreshCw, title: "Always improving", text: "New features, regularly." },
];

export const SECURITY_POINTS = [
  "256-bit encryption",
  "Files deleted automatically",
  "No files used to train AI",
  "GDPR-friendly",
];

// TODO: set real years/milestones.
export const TIMELINE = [
  { year: "2025", label: "Idea" },
  { year: "2026", label: "Launch" },
  { year: "Next", label: "More AI tools" },
  { year: "Soon", label: "Team workspaces" },
];

// TODO: replace with real people, or remove this section.
export const TEAM = [
  { name: "Ayesha Khan", role: "Product Designer", image: "/images/about/feedback-profile-one.webp" },
  { name: "Usman Raza", role: "Frontend Developer", image: "/images/about/feedback-profile-two.webp" },
  { name: "Fatima Ahmed", role: "Content Strategist", image: "/images/about/feedback-profile-three.webp" },
];