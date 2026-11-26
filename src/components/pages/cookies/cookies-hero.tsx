import Image from "next/image";
import { SettingsIcon } from "@/components/general/icons/pdf-icons";

export function CookiesHero() {
  return (
    <section className="relative flex w-full flex-col justify-center py-24 sm:py-32">
      
      {/* 1. FULL-WIDTH BACKGROUND IMAGE */}
      <div className="absolute inset-y-0 left-1/2 -z-20 w-screen -translate-x-1/2 overflow-hidden">
        <Image
          src="/images/privacy/privacy-hero.webp" 
          alt="Cookie Policy Background"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* 2. READABILITY OVERLAY */}
      <div className="absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-linear-to-r from-background via-background/80 to-transparent sm:via-background/60 sm:to-transparent" />

      {/* 3. CONTENT */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 flex items-center gap-2 rounded-full border border-primary/20 bg-background/50 px-4 py-1.5 backdrop-blur-md">
          <SettingsIcon className="size-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Legal</span>
        </div>
        
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Cookie Policy
        </h1>
        
        <p className="mt-6 max-w-lg text-lg font-medium text-foreground/80 sm:text-xl">
          This policy explains how PDFBerri uses cookies and similar technologies to recognize you when you visit our website.
        </p>
        
        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-semibold text-muted-foreground">
          <p>Effective date: October 26, 2026</p>
          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground sm:block" />
          <p>Last updated: October 26, 2026</p>
        </div>
      </div>
    </section>
  );
}