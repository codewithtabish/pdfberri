export type NavLink = {
  label: string;
  href: string;
};

export type NavGroup = {
  label: string;
  href: string;
  links: NavLink[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "All PDF Tools",
    href: "/tools",
    links: [
      { label: "Merge PDF", href: "/tools/merge-pdf" },
      { label: "Split PDF", href: "/tools/split-pdf" },
      { label: "Compress PDF", href: "/tools/compress-pdf" },
      { label: "Rotate PDF", href: "/tools/rotate-pdf" },
      { label: "Protect PDF", href: "/tools/protect-pdf" },
      { label: "View all tools", href: "/tools" },
    ],
  },
  {
    label: "AI Tools",
    href: "/ai-tools",
    links: [
      { label: "Chat with PDF", href: "/ai-tools/chat-with-pdf" },
      { label: "AI PDF Summarizer", href: "/ai-tools/summarize-pdf" },
      { label: "AI PDF Translator", href: "/ai-tools/translate-pdf" },
      { label: "AI Notes Generator", href: "/ai-tools/notes-generator" },
      { label: "AI Quiz Generator", href: "/ai-tools/quiz-generator" },
      { label: "AI Flashcard Generator", href: "/ai-tools/flashcard-generator" },
      { label: "AI Data Extractor", href: "/ai-tools/data-extractor" },
    ],
  },
  {
    label: "Convert PDF",
    href: "/tools",
    links: [
      { label: "PDF to Word", href: "/tools/pdf-to-word" },
      { label: "Word to PDF", href: "/tools/word-to-pdf" },
      { label: "PDF to JPG", href: "/tools/pdf-to-jpg" },
      { label: "JPG to PDF", href: "/tools/jpg-to-pdf" },
      { label: "PDF to Excel", href: "/tools/pdf-to-excel" },
      { label: "Excel to PDF", href: "/tools/excel-to-pdf" },
      { label: "HTML to PDF", href: "/tools/html-to-pdf" },
    ],
  },
  {
    label: "Edit PDF",
    href: "/tools/edit-pdf",
    links: [
      { label: "Edit PDF", href: "/tools/edit-pdf" },
      { label: "Add Page Numbers", href: "/tools/add-page-numbers" },
      { label: "Add Watermark", href: "/tools/add-watermark" },
      { label: "Annotate PDF", href: "/tools/annotate-pdf" },
      { label: "Sign PDF", href: "/tools/sign-pdf" },
    ],
  },
  {
    label: "Organize PDF",
    href: "/tools",
    links: [
      { label: "Extract Pages", href: "/tools/extract-pages" },
      { label: "Delete Pages", href: "/tools/delete-pages" },
      { label: "Rearrange Pages", href: "/tools/rearrange-pages" },
    ],
  },
  {
    label: "More Tools",
    href: "/tools",
    links: [
      { label: "Unlock PDF", href: "/tools/unlock-pdf" },
      { label: "OCR PDF", href: "/tools/ocr-pdf" },
      { label: "Extract Text", href: "/tools/extract-text" },
      { label: "Extract Images", href: "/tools/extract-images" },
    ],
  },
];