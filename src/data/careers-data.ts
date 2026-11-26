import type { ComponentType } from "react";
import {
  BoltIcon,
  ChatIcon,
  EditIcon,
  GraduationCapIcon,
  HeadsetIcon,
  HeartIcon,
  HomeIcon,
  HtmlIcon,
  PaletteIcon,
  ServerIcon,
} from "@/components/general/icons/pdf-icons";

export type IconType = ComponentType<{ className?: string }>;

// ---------- Contact ----------
const DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "pdfberri.com";
export const CAREERS_EMAIL = `careers@${DOMAIN}`;

export function applyHref(role?: string) {
  const subject = role ? `Application: ${role}` : "Resume submission";
  return `mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

// ---------- Why work with us ----------
// TODO: keep only what is true for your team.
export const PERKS: { icon: IconType; title: string; text: string }[] = [
  {
    icon: HeartIcon,
    title: "Meaningful work",
    text: "Help people finish everyday document tasks without frustration.",
  },
  {
    icon: HomeIcon,
    title: "Remote-friendly",
    text: "Work from wherever you do your best work.",
  },
  {
    icon: GraduationCapIcon,
    title: "Learn and grow",
    text: "Build real skills across PDF, web and AI technology.",
  },
  {
    icon: BoltIcon,
    title: "Simple and focused",
    text: "Clear goals, small steps and very little busywork.",
  },
];

// ---------- How we work ----------
export const WORK_POINTS = [
  "We prefer simple solutions over complicated ones.",
  "We ship small improvements often and learn from them.",
  "We describe our product honestly, with no inflated claims.",
  "We write things down so everyone stays in sync.",
];

// ---------- Open positions ----------
// TODO: keep only roles you are really hiring for.
// If the list is empty, the page shows a friendly "no open roles" state.
export type Role = {
  id: string;
  title: string;
  department: "Engineering" | "Design" | "Content" | "Support";
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  icon: IconType;
};

export const ROLES: Role[] = [
  { id: "frontend-developer", title: "Frontend Developer", department: "Engineering", location: "Remote", type: "Full-time", icon: HtmlIcon },
  { id: "backend-developer", title: "Backend Developer", department: "Engineering", location: "Remote", type: "Full-time", icon: ServerIcon },
  { id: "product-designer", title: "Product Designer", department: "Design", location: "Remote", type: "Full-time", icon: PaletteIcon },
  { id: "content-writer", title: "Content Writer", department: "Content", location: "Remote", type: "Part-time", icon: EditIcon },
  { id: "support-specialist", title: "Support Specialist", department: "Support", location: "Remote", type: "Full-time", icon: HeadsetIcon },
];

export const DEPARTMENTS = ["All", "Engineering", "Design", "Content", "Support"] as const;

// ---------- Hiring process ----------
// TODO: adjust to how you really hire.
export const PROCESS = [
  { step: 1, label: "Apply" },
  { step: 2, label: "Intro chat" },
  { step: 3, label: "Task" },
  { step: 4, label: "Offer" },
];

export { ChatIcon };