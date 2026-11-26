import { ChatIcon, BoltIcon, SettingsIcon, RefreshIcon, SparklesIcon, ProtectIcon, BriefcaseIcon, HeadsetIcon, ChevronRightIcon } from "@/components/general/icons/pdf-icons";

const CATEGORIES = [
  { icon: ChatIcon, title: "General Questions", desc: "Learn about PDFBerri and its services." },
  { icon: BoltIcon, title: "Getting Started", desc: "Find out how to use the platform." },
  { icon: SettingsIcon, title: "PDF Tools", desc: "Learn about editing, organizing, and managing PDFs." },
  { icon: RefreshIcon, title: "File Conversion", desc: "Understand supported formats and conversions." },
  { icon: SparklesIcon, title: "AI Tools", desc: "Explore intelligent document features." },
  { icon: ProtectIcon, title: "Privacy & Security", desc: "Understand document handling and security." },
  { icon: BriefcaseIcon, title: "Accounts & Billing", desc: "Find answers about accounts and available plans." },
  { icon: HeadsetIcon, title: "Troubleshooting", desc: "Resolve common processing and technical problems." },
];

export function FaqCategories() {
  return (
    <section className="mx-auto mt-24 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <h2 className="text-center text-3xl font-bold text-foreground">How can we help you?</h2>
      
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat, i) => (
          <button key={i} className="group flex flex-col items-start rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-sm">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <cat.icon className="size-6" />
            </div>
            <h3 className="font-semibold text-foreground">{cat.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-snug">{cat.desc}</p>
            <ChevronRightIcon className="mt-4 size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </button>
        ))}
      </div>
    </section>
  );
}