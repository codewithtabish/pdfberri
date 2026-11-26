import Image from "next/image";
import Link from "next/link";

import {
  ArrowRightIcon,
  ChatIcon,
  DataExtractorIcon,
  FlashcardIcon,
  NotesIcon,
  QuizIcon,
  SparkleIcon,
  SummarizeIcon,
  TranslateIcon,
} from "@/components/general/icons/pdf-icons";

const AI_TOOLS = [
  { name: "Chat with PDF", desc: "Ask anything", href: "/ai-tools/chat-with-pdf", icon: ChatIcon },
  { name: "AI PDF Summarizer", desc: "Get key points", href: "/ai-tools/summarize-pdf", icon: SummarizeIcon },
  { name: "AI PDF Translator", desc: "Break language barriers", href: "/ai-tools/translate-pdf", icon: TranslateIcon },
  { name: "AI Notes Generator", desc: "Create notes instantly", href: "/ai-tools/notes-generator", icon: NotesIcon },
  { name: "AI Quiz Generator", desc: "Test your knowledge", href: "/ai-tools/quiz-generator", icon: QuizIcon },
  { name: "AI Flashcard Generator", desc: "Study smarter", href: "/ai-tools/flashcard-generator", icon: FlashcardIcon },
  { name: "AI Data Extractor", desc: "Pull structured data", href: "/ai-tools/data-extractor", icon: DataExtractorIcon },
] as const;

export function AiAssistant() {
  return (
    <section
      aria-labelledby="ai-assistant-heading"
      className="relative isolate mt-10 overflow-hidden rounded-3xl border border-primary/15 bg-linear-to-br from-primary/10 via-background to-violet-500/10 p-6 shadow-xl shadow-primary/5 sm:mt-12 sm:p-8 lg:p-10"
    >
      {/* soft background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-24 -z-10 size-72 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-16 -z-10 size-72 rounded-full bg-violet-500/15 blur-3xl"
      />

      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-6 xl:gap-10">
        {/* left: copy */}
        <div className="flex flex-col items-start">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur">
            <SparkleIcon className="size-3.5" />
            AI Tools
          </div>

          <h2
            id="ai-assistant-heading"
            className="mt-4 text-balance text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl"
          >
            Meet your AI document assistant
          </h2>

          <p className="mt-3 max-w-sm text-pretty text-sm text-muted-foreground sm:text-base">
            Chat, summarize, translate and get more from your PDFs with AI.
          </p>

          <Link
            href="/ai-tools"
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 active:translate-y-0"
          >
            Try AI Tools
            <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* middle: chat preview */}
        <div className="relative">
          <Image
            src="/images/home/pdfberri-chat-with-pdf.webp"
            alt="Chat with PDF preview: asking the AI for the key points of a document"
            width={1600}
            height={800}
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="h-auto w-full rounded-2xl mix-blend-multiply dark:mix-blend-normal"
          />
        </div>

        {/* right: tools list */}
        <ul className="grid gap-1 md:grid-cols-2 lg:grid-cols-1 lg:border-l lg:border-border/60 lg:pl-6 xl:pl-8">
          {AI_TOOLS.map(({ name, desc, href, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-primary/8 focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                  <Icon className="size-[18px]" />
                </span>
                <span className="min-w-0 leading-snug">
                  <span className="font-bold text-foreground">{name}</span>
                  <span className="text-muted-foreground"> – {desc}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}