import Image from "next/image";
import { MailIcon } from "@/components/general/icons/pdf-icons";

export function ContactHero() {
  return (
    <section className="relative flex w-full flex-col items-center pt-16 pb-12 sm:pt-24 sm:pb-16">
      {/* Background Image Layer */}
      <div className="absolute inset-0 -z-10 mx-auto max-w-7xl overflow-hidden rounded-3xl">
        <Image
          src="/images/contact/contact-hero.webp"
          alt="PDFBerri Contact Hero"
          fill
          priority
          className="object-cover object-center opacity-80 sm:opacity-100"
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-primary/20 bg-background/50 px-4 py-1.5 backdrop-blur-sm">
          <MailIcon className="size-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Contact us</span>
        </div>
        
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          We'd love to <br className="hidden sm:block" />
          <span className="text-primary">hear from you</span>
        </h1>
        
        <p className="mt-4 max-w-lg text-lg text-muted-foreground">
          Have a question, feedback, or need help with a document? Our team is here to assist you.
        </p>
      </div>
    </section>
  );
}