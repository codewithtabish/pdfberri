import Image from "next/image";
import { ShieldCheckIcon } from "@/components/general/icons/pdf-icons";

export function PrivacyHero() {
  return (
    <section className="relative flex w-full flex-col justify-center py-24 sm:py-32">
      
      {/* 
        1. FULL-WIDTH BACKGROUND IMAGE
        We use `w-[100vw] left-1/2 -translate-x-1/2` to force the background 
        to break out of your global Container and stretch edge-to-edge.
      */}
      <div className="absolute inset-y-0 left-1/2 -z-20 w-screen -translate-x-1/2 overflow-hidden">
        <Image
          src="/images/privacy/privacy-hero.webp"
          alt="Privacy Hero Background"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* 
        2. READABILITY OVERLAY
        Adds a soft fade from the left (matching your app background) to the right.
        This ensures the black text is 100% readable over the busy image.
      */}
      <div className="absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-linear-to-r from-background via-background/80 to-transparent sm:via-background/60 sm:to-transparent" />

      {/* 3. CONTENT (Stays perfectly aligned with your global Container grid) */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 flex items-center gap-2 rounded-full border border-primary/20 bg-background/50 px-4 py-1.5 backdrop-blur-md">
          <ShieldCheckIcon className="size-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Your Privacy Matters</span>
        </div>
        
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Privacy Policy
        </h1>
        
        <p className="mt-6 max-w-lg text-lg font-medium text-foreground/80 sm:text-xl">
          Learn how PDFBerri handles your documents, protects your data, and ensures a secure workspace for all your PDF tasks.
        </p>
        
        <p className="mt-8 text-sm font-semibold text-muted-foreground">
          Last updated: October 26, 2026
        </p>
      </div>
    </section>
  );
}