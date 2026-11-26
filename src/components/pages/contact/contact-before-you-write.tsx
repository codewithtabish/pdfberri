import { QuizIcon, FolderOpenIcon, ProtectIcon, AlertCircleIcon, ArrowRightIcon } from "@/components/general/icons/pdf-icons";

const LINKS = [
  { icon: QuizIcon, title: "FAQ", href: "/faq" },
  { icon: FolderOpenIcon, title: "Help Center", href: "/help" },
  { icon: ProtectIcon, title: "Security & privacy", href: "/privacy" },
  { icon: AlertCircleIcon, title: "Report a problem", href: "/report" },
];

export function ContactBeforeYouWrite() {
  return (
    <section className="mt-16 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-foreground">Before you write</h2>
      <p className="mt-2 text-muted-foreground">You might find the answer you're looking for here.</p>
      
      <div className="mt-8 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map((link, i) => (
          <a key={i} href={link.href} className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm">
            <div className="flex items-center gap-3">
              <link.icon className="size-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">{link.title}</span>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </a>
        ))}
      </div>
    </section>
  );
}