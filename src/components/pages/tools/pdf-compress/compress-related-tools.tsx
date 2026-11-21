import Link from "next/link";
import { ArrowRightIcon, CompressIcon, MergeIcon, OrganizeIcon, ProtectIcon, RotateIcon, SplitIcon, TrashIcon } from "@/components/general/icons/pdf-icons";

const TOOLS = [
  { title: "Merge PDF", description: "Combine multiple PDFs.", href: "/tools/merge-pdf", Icon: MergeIcon },
  { title: "Split PDF", description: "Split into multiple files.", href: "/tools/split-pdf", Icon: SplitIcon },
  { title: "Delete PDF Pages", description: "Remove unwanted pages.", href: "/tools/delete-pdf-pages", Icon: TrashIcon },
  { title: "Rearrange PDF Pages", description: "Change page order.", href: "/tools/rearrange-pdf-pages", Icon: OrganizeIcon },
  { title: "Rotate PDF", description: "Rotate your pages.", href: "/tools/rotate-pdf", Icon: RotateIcon },
  { title: "Protect PDF", description: "Add password protection.", href: "/tools/protect-pdf", Icon: ProtectIcon },
] as const;

export function CompressRelatedTools() {
  return (
    <section aria-labelledby="compress-related-heading" className="space-y-6">
      <h2 id="compress-related-heading" className="text-center text-2xl font-bold text-foreground">Related PDF tools</h2>
      <nav aria-label="Related PDF tools">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(({ title, description, href, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="size-6 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-foreground">{title}</span>
                  <span className="block text-xs text-muted-foreground">{description}</span>
                </span>
                <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}