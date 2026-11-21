
import { BoltIcon, CompressIcon, DownloadIcon, LayersIcon, MergeIcon, MultiplePagesIcon, OrganizeIcon, PageRangeIcon, PageSelectIcon, ProtectIcon, RotateIcon, TargetIcon, TrashIcon, UploadIcon } from "@/components/general/icons/pdf-icons";
import type { SplitMethod } from "./split-types";

export { SPLIT_CONFIG, SPLIT_ROUTE, SPLIT_ZIP_FILENAME } from "./split-config";


export const SPLIT_METHODS: ReadonlyArray<{
  id: SplitMethod;
  title: string;
  description: string;
  Icon: typeof PageSelectIcon;
}> = [
  {
    id: "selected-pages",
    title: "Extract selected pages",
    description: "Create a new PDF with your selected pages.",
    Icon: PageSelectIcon,
  },
  {
    id: "page-ranges",
    title: "Split by page ranges",
    description: "Split using custom page ranges.",
    Icon: PageRangeIcon,
  },
  {
    id: "every-page",
    title: "Extract every page",
    description: "Create separate PDFs for each page.",
    Icon: MultiplePagesIcon,
  },
  {
    id: "equal-parts",
    title: "Split into equal parts",
    description: "Divide your PDF into equal parts.",
    Icon: OrganizeIcon,
  },
];

export const SPLIT_STEPS = [
  { title: "Upload your PDF", description: "Choose a PDF from your device.", Icon: UploadIcon },
  { title: "Choose your pages", description: "Select pages or set ranges.", Icon: PageRangeIcon },
  { title: "Split and download", description: "Get your new PDF files.", Icon: DownloadIcon },
] as const;

export const SPLIT_FEATURES = [
  { title: "Precise page selection", description: "Pick exactly what you need.", Icon: TargetIcon },
  { title: "Flexible splitting", description: "Split by ranges or equal parts.", Icon: LayersIcon },
  { title: "Local processing", description: "Your files stay in your browser.", Icon: ProtectIcon },
  { title: "Easy downloads", description: "Download one file or a ZIP.", Icon: BoltIcon },
] as const;

export const SPLIT_FAQS = [
  {
    question: "How do I split a PDF into multiple files?",
    answer:
      "Upload your PDF, choose your pages or ranges, and use the Split PDF button. You can create multiple files from one document and download them individually or as a ZIP.",
  },
  {
    question: "Can I extract specific pages from a PDF?",
    answer:
      "Yes. Choose Extract selected pages, click the page thumbnails you want, and PDFBerri creates one new PDF containing those pages in their original order.",
  },
  {
    question: "Can I split every PDF page into a separate file?",
    answer:
      "Yes. Choose Extract every page to create one PDF per page. Very large documents may exceed the output limit, in which case you will see a message before processing starts.",
  },
  {
    question: "Can I split a PDF by page ranges?",
    answer:
      "Yes. Add ranges such as 1–5 and 6–10. Ranges cannot overlap. If your ranges leave pages out, those pages simply won't appear in any output and you'll see a notice.",
  },
  {
    question: "Can I divide a PDF into equal parts?",
    answer:
      "Yes. Enter the number of parts and PDFBerri shows the exact page ranges first. When pages don't divide evenly, the earlier parts receive one extra page each.",
  },
  {
    question: "Does PDFBerri upload my PDF?",
    answer:
      "No. Splitting runs in your browser, so your PDF is not sent to PDFBerri servers for this tool. Preview, splitting, and ZIP creation all happen on your device.",
  },
  {
    question: "Can I split a password-protected PDF?",
    answer:
      "Not directly. Encrypted PDFs can't be split here. If you are authorized to open the document, remove its protection first with a tool you're permitted to use, then try again.",
  },
  {
    question: "Is there a PDF file size limit?",
    answer:
      "Yes. Because everything runs on your device, the Split PDF tool accepts PDFs up to 100 MB and 2,000 pages. Very large files may be slower on phones and older computers.",
  },
] as const;

export const SPLIT_RELATED_TOOLS = [
  { title: "Merge PDF", description: "Combine multiple PDFs.", href: "/tools/merge-pdf", Icon: MergeIcon },
  { title: "Compress PDF", description: "Reduce file size.", href: "/tools/compress-pdf", Icon: CompressIcon },
  { title: "Delete PDF Pages", description: "Remove unwanted pages.", href: "/tools/delete-pdf-pages", Icon: TrashIcon },
  { title: "Rearrange PDF Pages", description: "Change page order.", href: "/tools/rearrange-pdf-pages", Icon: OrganizeIcon },
  { title: "Rotate PDF", description: "Rotate your pages.", href: "/tools/rotate-pdf", Icon: RotateIcon },
  { title: "Protect PDF", description: "Add password protection.", href: "/tools/protect-pdf", Icon: ProtectIcon },
] as const;

/** Shared control styling, built only from existing theme tokens. */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const SPLIT_UI = {
  focusRing,
  primaryButton: `inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 ${focusRing}`,
  secondaryButton: `inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-card px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-50 ${focusRing}`,
  textButton: `inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50 ${focusRing}`,
  dangerButton: `inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50 ${focusRing}`,
  input: `h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground tabular-nums placeholder:text-muted-foreground ${focusRing}`,
  card: "rounded-2xl border border-border bg-card shadow-sm",
} as const;
