import Image from "next/image";
import Link from "next/link";
import { MailIcon, HeadsetIcon, BriefcaseIcon, ChevronRightIcon } from "@/components/general/icons/pdf-icons";

const INFO_CARDS = [
  { icon: MailIcon, title: "Email us", desc: "support@pdfberri.com", href: "mailto:support@pdfberri.com" },
  { icon: HeadsetIcon, title: "Help center", desc: "Browse our guides", href: "/help" },
  { icon: BriefcaseIcon, title: "Business", desc: "Partnerships & sales", href: "/contact?subject=business" },
];

export function ContactInfoCards() {
  return (
    <div className="flex flex-col gap-4">
      {/* Info Cards */}
      {INFO_CARDS.map((card, i) => (
        <Link 
          key={i} 
          href={card.href}
          className="group flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <card.icon className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
            </div>
          </div>
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </Link>
      ))}

      {/* Mascot Banner - Fixed to match the design */}
      <div className="relative mt-2 flex min-h-[140px] items-center overflow-hidden rounded-2xl bg-[#EBF3FF] dark:bg-primary/5 border border-[#D6E4FF] dark:border-primary/10">
        
        {/* Text Content */}
        <div className="relative z-10 flex w-[60%] flex-col p-6">
          <p className="text-[15px] font-bold text-primary">Need quick answers?</p>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
            Berri is always here to help you out.
          </p>
        </div>

        {/* Mascot Image - Positioned absolutely to the right */}
        <div className="absolute right-0 bottom-0 top-0 w-[50%]">
          <Image 
            src="/images/contact/sidebar-mascot.webp" 
            alt="Berri Mascot" 
            fill 
            className="object-cover object-bottom-left" // Ensures the mascot sits nicely
          />
        </div>
      </div>
    </div>
  );
}