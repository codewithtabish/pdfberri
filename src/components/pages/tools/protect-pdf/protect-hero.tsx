"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { LockIcon } from "@/components/general/icons/pdf-icons";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ProtectHero() {
  const reduce = useReducedMotion();

  return (
    <header className="grid items-center gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="flex flex-col gap-5"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
          Protect PDF with a <span className="text-primary">Password</span>
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Secure your PDF documents with password protection. Control who can open your files and what they can do
          with them.
        </p>
        <p className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-sm">
          <LockIcon className="size-4 shrink-0 text-primary" />
          <span>Runs in your browser. Your PDF and password are never uploaded.</span>
        </p>
      </motion.div>

      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative aspect-2/1 w-full"
        >
          <Image
            src="/images/protect-pdf/Secure_PDF_Shield_Orbit.webp"
            alt="A PDF document protected by a blue padlock shield"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover object-[56%_50%]"
          />
        </motion.div>
      </motion.div>
    </header>
  );
}