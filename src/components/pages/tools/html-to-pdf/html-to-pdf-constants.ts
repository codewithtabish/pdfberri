/**
 * PDFBerri HTML → PDF — Constants
 */

export const TOOL_SLUG = "html-to-pdf";
export const TOOL_NAME = "HTML to PDF Converter";
export const TOOL_DESCRIPTION =
  "Convert HTML files, pasted HTML code, and supported webpages into professional PDF documents quickly and easily.";

export const ACCEPTED_EXTENSIONS = [".html", ".htm"] as const;
export const ACCEPTED_MIME_TYPES = ["text/html", "application/xhtml+xml"] as const;

export const STAGE_MESSAGES: Record<string, string> = {
  validating: "Checking your HTML...",
  preparing: "Preparing your document...",
  "resource-loading": "Loading styles, fonts, and images...",
  rendering: "Rendering your HTML...",
  "generating-pdf": "Generating your PDF...",
  "validating-pdf": "Checking your PDF...",
  completed: "Your PDF is ready!",
  failed: "Conversion failed",
  cancelled: "Conversion cancelled",
  "timed-out": "Conversion timed out",
};

export const ERROR_MESSAGES: Record<string, { title: string; message: string; actionable?: string }> = {
  INVALID_HTML: {
    title: "Invalid HTML",
    message: "The provided content does not appear to be valid HTML.",
    actionable: "Please check your markup and try again.",
  },
  EMPTY_HTML: {
    title: "Empty content",
    message: "No HTML content was provided.",
    actionable: "Upload a file, paste HTML, or enter a URL.",
  },
  FILE_TOO_LARGE: {
    title: "File too large",
    message: "The HTML file exceeds the maximum allowed size (5 MB).",
    actionable: "Try a smaller file or remove large embedded resources.",
  },
  UNSUPPORTED_EXTENSION: {
    title: "Unsupported file type",
    message: "Only .html and .htm files are accepted.",
  },
  INVALID_URL: {
    title: "Invalid URL",
    message: "The URL you entered is not valid.",
    actionable: "Enter a full URL starting with https://",
  },
  UNSAFE_URL: {
    title: "URL not allowed",
    message: "This URL cannot be converted for security reasons.",
    actionable: "Only public HTTPS websites are supported.",
  },
  RESOURCE_LOAD_FAILED: {
    title: "Resource loading failed",
    message: "Some styles, fonts, or images could not be loaded.",
    actionable: "The PDF was still generated with available resources.",
  },
  RENDERING_TIMEOUT: {
    title: "Rendering timed out",
    message: "The document took too long to render.",
    actionable: "Try simplifying the HTML or reducing external resources.",
  },
  BROWSER_INIT_FAILED: {
    title: "Renderer unavailable",
    message: "The conversion engine could not start.",
    actionable: "Please try again in a few moments.",
  },
  PDF_GENERATION_FAILED: {
    title: "PDF generation failed",
    message: "We could not create a valid PDF from your HTML.",
    actionable: "Check your HTML and try again.",
  },
  OUTPUT_TOO_LARGE: {
    title: "PDF too large",
    message: "The generated PDF exceeds the maximum size limit.",
    actionable: "Reduce images or content and try again.",
  },
  DOWNLOAD_FAILED: {
    title: "Download failed",
    message: "The PDF could not be downloaded.",
    actionable: "Try converting again.",
  },
  CANCELLED: {
    title: "Cancelled",
    message: "You cancelled the conversion.",
  },
  EXPIRED: {
    title: "Link expired",
    message: "This conversion result has expired.",
    actionable: "Please convert the file again.",
  },
  UNAUTHORIZED: {
    title: "Unauthorized",
    message: "You do not have access to this conversion.",
  },
  RATE_LIMITED: {
    title: "Too many requests",
    message: "You have reached the conversion limit. Please wait a moment.",
  },
  INTERNAL_ERROR: {
    title: "Something went wrong",
    message: "An unexpected error occurred during conversion.",
    actionable: "Please try again. If the problem persists, contact support.",
  },
  UNSUPPORTED_CONTENT: {
    title: "Unsupported content",
    message: "This type of content cannot be converted.",
  },
};

export const POPULAR_TOOLS = [
  { slug: "html-to-pdf", name: "HTML to PDF", iconKey: "htmlToPdf" },
  { slug: "pdf-to-word", name: "PDF to Word", iconKey: "pdfToWord" },
  { slug: "word-to-pdf", name: "Word to PDF", iconKey: "wordToPdf" },
  { slug: "pdf-to-excel", name: "PDF to Excel", iconKey: "pdfToExcel" },
  { slug: "excel-to-pdf", name: "Excel to PDF", iconKey: "excelToPdf" },
  { slug: "jpg-to-pdf", name: "JPG to PDF", iconKey: "jpgToPdf" },
  { slug: "pdf-to-jpg", name: "PDF to JPG", iconKey: "pdfToJpg" },
  { slug: "merge-pdf", name: "Merge PDF", iconKey: "mergePdf" },
  { slug: "split-pdf", name: "Split PDF", iconKey: "splitPdf" },
  { slug: "compress-pdf", name: "Compress PDF", iconKey: "compressPdf" },
  { slug: "protect-pdf", name: "Protect PDF", iconKey: "protectPdf" },
] as const;

export const FAQ_ITEMS = [
  {
    question: "Which HTML formats are supported?",
    answer:
      "PDFBerri accepts .html and .htm files, pasted HTML code (full documents or fragments), and public HTTPS webpage URLs when the secure renderer is available.",
  },
  {
    question: "Can CSS styles be preserved?",
    answer:
      "Yes. Inline styles, internal stylesheets, and supported external CSS are rendered with high fidelity using a real Chromium engine. Flexbox, Grid, tables, backgrounds, and most modern CSS features are supported.",
  },
  {
    question: "Can external images and fonts be included?",
    answer:
      "Yes, when they are reachable over HTTPS and within size limits. Broken or blocked resources are skipped so the rest of the document still converts.",
  },
  {
    question: "Can I convert a webpage URL?",
    answer:
      "Yes, for public HTTPS pages. Private networks, localhost, and unsafe destinations are blocked for security. JavaScript is disabled by default for safety.",
  },
  {
    question: "Are my files stored?",
    answer:
      "No. Uploaded HTML and generated PDFs are processed in temporary private storage and automatically deleted after a short period. We do not permanently store your documents.",
  },
] as const;
