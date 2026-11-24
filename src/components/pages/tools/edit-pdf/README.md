# PDFBerri – Edit PDF

Production-oriented Edit PDF feature module for the PDFBerri codebase.

## Location

Place this folder at:

```
src/components/pages/tools/edit-pdf/
```

## Dependencies (already expected in PDFBerri)

- `pdfjs-dist` (rendering + text extraction)
- `pdf-lib` (document modification & export)
- Existing shadcn/ui components (`Button`, `Input`, `Slider`, `Select`, `Accordion`, `Tooltip`, …)
- Existing `cn` utility (`@/lib/utils`)
- Manrope font + design tokens already configured in the root layout

## Entry point

```tsx
import { EditPdfPage } from "@/components/pages/tools/edit-pdf";

// In your App Router page.tsx for /edit-pdf
export default function Page() {
  return <EditPdfPage />;
}
```

## Architecture overview

| File | Responsibility |
|------|----------------|
| `edit-pdf-types.ts` | Strongly typed document / object model |
| `edit-pdf-constants.ts` | Limits, defaults, labels, shortcuts |
| `edit-pdf-coordinates.ts` | PDF ↔ viewport coordinate conversion |
| `edit-pdf-validation.ts` | Upload validation (MIME, signature, encryption, size) |
| `edit-pdf-history.ts` | Command pattern + undo/redo |
| `edit-pdf-loader.ts` | PDF.js document loading |
| `edit-pdf-renderer.ts` | Page & thumbnail rendering |
| `edit-pdf-export.ts` | pdf-lib export pipeline |
| `use-edit-pdf.ts` | Central reducer + actions hook |
| `edit-pdf-page.tsx` | Top-level UI state machine (upload → workspace) |
| `edit-pdf-workspace.tsx` | Full editor layout |
| `edit-pdf-*.tsx` | Individual UI pieces (toolbar, canvas, properties, …) |

## Privacy

All processing is local-first (File API → ArrayBuffer → PDF.js / pdf-lib → Blob download). No automatic upload to any server.

## Known limitations (honest)

- True Word-like editing of arbitrary existing text is not always possible because of how PDFs store text.
- Secure redaction is only as strong as the underlying libraries; visual covering is never advertised as permanent secure redaction.
- Signature tool produces a visual image, not a cryptographic digital signature.
- Very large documents (>50 MB / >200 pages) may hit browser memory limits.

## Integration notes

1. Ensure the global PDF.js worker is already configured the same way other PDFBerri tools do it.
2. Wire the route (`app/edit-pdf/page.tsx` or equivalent) to render `<EditPdfPage />`.
3. Reuse the existing SEO / metadata pattern used by Compress PDF, PDF to JPG, etc.
4. The related-tools links point at the real existing routes; adjust if your slugs differ.

## Tests to add (project test runner)

- Upload validation (invalid type, empty, oversized, encrypted)
- Coordinate conversion round-trips
- Command history (add → undo → redo)
- Export produces a readable PDF
- Page deletion refuses to delete the last page
