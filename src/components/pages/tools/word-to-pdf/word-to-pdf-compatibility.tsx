// src/components/pages/tools/word-to-pdf/word-to-pdf-compatibility.tsx

export function WordToPdfCompatibility() {
  return (
    <section
      aria-labelledby="word-to-pdf-compat-heading"
      className="space-y-3 rounded-2xl border border-border bg-card p-5"
    >
      <h2 id="word-to-pdf-compat-heading" className="text-lg font-bold tracking-tight">
        Formatting compatibility
      </h2>
      <p className="text-sm text-muted-foreground">
        Text, headings, tables, images, headers, footers, footnotes and page
        breaks are converted. Fidelity depends on your document and on the fonts
        available in your browser, and complex layouts (for example some
        text boxes, SmartArt or equations) may not match Word exactly.
      </p>
      <p className="text-sm text-muted-foreground">
        For the closest match, use common fonts or embed fonts in Word before
        converting, then review the PDF.
      </p>
    </section>
  );
}
