"use client";

import { ChevronDownIcon } from "@/components/general/icons/pdf-icons";

const FAQS_LEFT = [
  { q: "What is PDFBerri?", a: "PDFBerri is an online PDF productivity workspace that brings document conversion, editing, organization, compression, security, OCR, extraction, and AI-powered tools together in one place." },
  { q: "What can I do with PDFBerri?", a: "You can merge, split, compress, convert, rotate, unlock, protect, and edit PDF documents, as well as use AI to chat with, summarize, or translate your files." },
  { q: "Is PDFBerri free to use?", a: "Yes, most of our essential PDF tools are completely free. Some advanced AI features may have usage limits." },
  { q: "Do I need to install software?", a: "No, PDFBerri is entirely web-based. You only need a browser and an internet connection." },
  { q: "Can I use PDFBerri on my mobile device?", a: "Yes, our interface is fully responsive and designed to work perfectly on mobile phones and tablets." },
  { q: "How do I merge multiple PDF files?", a: "Navigate to the Merge PDF tool, upload your files, arrange their order, and click merge." },
  { q: "How can I split a PDF?", a: "Use the Split PDF tool to extract specific pages, split by ranges, or separate every page." },
  { q: "How do I compress a PDF?", a: "Go to Compress PDF, upload your file, and choose your preferred compression level." },
  { q: "Can I convert a PDF to Word?", a: "Yes, our PDF to Word tool accurately converts your PDF into an editable .docx file." },
  { q: "Can I convert Word documents to PDF?", a: "Absolutely. Use the Word to PDF tool to convert your .docx files." },
];

const FAQS_RIGHT = [
  { q: "Which file formats are supported?", a: "We support PDF, DOCX, XLSX, PPTX, JPG, PNG, and various other formats for both input and output." },
  { q: "Why is my PDF file not uploading?", a: "Check if the file is password-protected or exceeds our maximum file size limit." },
  { q: "What happens if my PDF is password-protected?", a: "You must use the Unlock PDF tool first before using other tools." },
  { q: "Why is my converted document different from the original?", a: "Complex layouts, fonts, or embedded objects can sometimes render differently." },
  { q: "What is Chat with PDF?", a: "It's an AI tool that allows you to ask questions and get answers based on the content of your uploaded document." },
  { q: "Can AI summarize my PDF?", a: "Yes, our AI Summarizer can extract key points and generate concise summaries." },
  { q: "Can I ask questions about an uploaded document?", a: "Yes, using Chat with PDF, you can ask follow-up questions and get contextual answers." },
  { q: "How does AI PDF translation work?", a: "The AI translates the text within your PDF while attempting to maintain the original layout." },
  { q: "Are my uploaded documents private?", a: "We take privacy seriously. Files are processed securely and deleted according to our retention policy." },
  { q: "Does PDFBerri process files locally or on its servers?", a: "Some tools use local browser processing, while more complex tasks require secure server processing." },
];

export function FaqPopular() {
  return (
    <section className="mx-auto mt-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground">Popular Questions</h2>
        <p className="mt-2 text-muted-foreground">Quick answers to the questions users ask most often.</p>
      </div>

      <div className="mt-10 grid gap-x-8 gap-y-4 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-3">
          {FAQS_LEFT.map((faq, i) => (
            <details key={i} className="group rounded-xl border border-border bg-card [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  <span>{faq.q}</span>
                </div>
                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:-rotate-180" />
              </summary>
              <div className="px-4 pb-4 pl-14 text-sm text-muted-foreground">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {FAQS_RIGHT.map((faq, i) => (
            <details key={i} className="group rounded-xl border border-border bg-card [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 11}</span>
                  <span>{faq.q}</span>
                </div>
                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:-rotate-180" />
              </summary>
              <div className="px-4 pb-4 pl-14 text-sm text-muted-foreground">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}