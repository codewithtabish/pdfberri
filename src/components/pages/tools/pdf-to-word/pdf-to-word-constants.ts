// src/components/pages/tools/pdf-to-word/pdf-to-word-constants.ts

import type { ComponentType } from "react";
import {
  BriefcaseIcon,
  ChartBarIcon,
  CompressIcon,
  ContractIcon,
  DownloadIcon,
  EditIcon,
  GraduationCapIcon,
  LayersIcon,
  OcrIcon,
  OrganizeIcon,
  PowerpointIcon,
  ProtectIcon,
  ReceiptIcon,
  SearchIcon,
  SettingsIcon,
  TextFileIcon,
  UploadIcon,
  WordIcon,
  ExcelIcon,
  BoltIcon,
} from "@/components/general/icons/pdf-icons";
import type { ConversionMode, ConversionStage } from "./pdf-to-word-types";

type IconType = ComponentType<{ className?: string }>;

export const PDF_TO_WORD_ROUTE = "/tools/pdf-to-word";

export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const PDF_TO_WORD_LIMITS = {
  maxFileSizeBytes: 50 * 1024 * 1024,
  maxPages: 200,
  maxOcrPages: 40,
  minTextCharsPerPage: 12,
} as const;

export const OCR_LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "urd", label: "Urdu" },
  { code: "ara", label: "Arabic" },
  { code: "hin", label: "Hindi" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "ita", label: "Italian" },
  { code: "por", label: "Portuguese" },
  { code: "rus", label: "Russian" },
  { code: "tur", label: "Turkish" },
  { code: "ind", label: "Indonesian" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
] as const;

export const CONVERSION_MODES: ReadonlyArray<{
  id: ConversionMode;
  title: string;
  description: string;
  Icon: IconType;
}> = [
  {
    id: "layout",
    title: "Best Layout Preservation",
    description:
      "Keeps line positions, font sizes, alignment, page size, tables and images as close to the original as possible.",
    Icon: OrganizeIcon,
  },
  {
    id: "editable",
    title: "Editable Text",
    description:
      "Rebuilds paragraphs, headings, lists and reading order so the document is easier to edit.",
    Icon: EditIcon,
  },
];

export const PROCESS_STAGES: ReadonlyArray<{
  id: ConversionStage;
  label: string;
}> = [
  { id: "reading", label: "Reading PDF" },
  { id: "extracting", label: "Extracting content" },
  { id: "ocr", label: "Recognizing scanned text" },
  { id: "building", label: "Reconstructing document structure" },
  { id: "validating", label: "Checking Word file" },
];

export const BENEFITS: ReadonlyArray<{
  title: string;
  description: string;
  Icon: IconType;
}> = [
  {
    title: "Editable Documents",
    description:
      "Turn selectable PDF text into a real .docx file you can keep editing in Word.",
    Icon: EditIcon,
  },
  {
    title: "Preserved Structure",
    description:
      "Headings, paragraphs, lists, images and simple tables are rebuilt where they can be detected.",
    Icon: LayersIcon,
  },
  {
    title: "OCR for Scanned PDFs",
    description:
      "Recognize text on scanned pages in many languages when OCR is turned on.",
    Icon: OcrIcon,
  },
  {
    title: "Two Conversion Modes",
    description:
      "Choose layout-focused output or a cleaner, easier-to-edit document.",
    Icon: SettingsIcon,
  },
  {
    title: "Private by Design",
    description:
      "Conversion runs in your browser. Your PDF is not uploaded to PDFBerri servers.",
    Icon: ProtectIcon,
  },
  {
    title: "Simple Workflow",
    description: "Select a PDF, pick your settings, convert, and download.",
    Icon: BoltIcon,
  },
];

export const HOW_IT_WORKS: ReadonlyArray<{
  title: string;
  description: string;
  Icon: IconType;
}> = [
  {
    title: "Upload your PDF",
    description: "Select a document from your device.",
    Icon: UploadIcon,
  },
  {
    title: "Choose conversion settings",
    description: "Pick a mode and turn on OCR if the PDF is scanned.",
    Icon: SettingsIcon,
  },
  {
    title: "Download your Word file",
    description: "Receive a .docx document and continue editing.",
    Icon: DownloadIcon,
  },
];

export const DOCUMENT_TYPES: ReadonlyArray<{ label: string; Icon: IconType }> =
  [
    { label: "Business Reports", Icon: ChartBarIcon },
    { label: "Academic Papers", Icon: GraduationCapIcon },
    { label: "Contracts & Forms", Icon: ContractIcon },
    { label: "Invoices", Icon: ReceiptIcon },
    { label: "Research Documents", Icon: SearchIcon },
    { label: "Scanned Documents", Icon: OcrIcon },
  ];

export const RELATED_TOOLS: ReadonlyArray<{
  name: string;
  href: string;
  Icon: IconType;
}> = [
  { name: "Word to PDF", href: "/tools/word-to-pdf", Icon: WordIcon },
  { name: "PDF to Excel", href: "/tools/pdf-to-excel", Icon: ExcelIcon },
  {
    name: "PDF to PowerPoint",
    href: "/tools/pdf-to-powerpoint",
    Icon: PowerpointIcon,
  },
  { name: "PDF to Text", href: "/tools/pdf-to-text", Icon: TextFileIcon },
  { name: "OCR PDF", href: "/tools/ocr-pdf", Icon: OcrIcon },
  { name: "Compress PDF", href: "/tools/compress-pdf", Icon: CompressIcon },
];

export const FAQ_ITEMS: ReadonlyArray<{ question: string; answer: string }> = [
  {
    question: "How do I convert PDF to Word?",
    answer:
      "Select your PDF, choose a conversion mode, turn on OCR if the document is scanned, and press Convert to Word. When the conversion finishes you can download the .docx file.",
  },
  {
    question: "Can I edit the converted Word document?",
    answer:
      "Yes. The result is a genuine .docx file with real text. Because PDFs do not store paragraphs or tables explicitly, PDFBerri reconstructs them. Please review the document in Word before using it.",
  },
  {
    question: "Will the original formatting be preserved?",
    answer:
      "Best Layout Preservation keeps page size, line positions, font sizes, alignment, images and simple tables as close as possible. Text colors, vector graphics and complex layouts may differ from the original. Editable Text trades layout accuracy for cleaner paragraphs.",
  },
  {
    question: "Can I convert scanned PDFs?",
    answer: `Yes, with OCR turned on. Text is recognized in your browser, for up to ${PDF_TO_WORD_LIMITS.maxOcrPages} pages per conversion. OCR is never perfectly accurate, so check names, numbers and tables. The OCR language data is downloaded once from a public CDN; your document is not uploaded.`,
  },
  {
    question: "Is my PDF uploaded anywhere?",
    answer:
      "No. Conversion happens in your browser and your original PDF is never modified. The only network request is the one-time download of OCR language data when OCR is used.",
  },
  {
    question: "What are the file limits?",
    answer: `PDFs up to ${PDF_TO_WORD_LIMITS.maxFileSizeBytes / (1024 * 1024)} MB and ${PDF_TO_WORD_LIMITS.maxPages} pages are supported, because conversion uses your device's memory.`,
  },
  {
    question: "Can I convert a password-protected PDF?",
    answer:
      "If you are authorized to open the document, enter its password and conversion continues. PDFBerri does not bypass passwords or access restrictions.",
  },
];