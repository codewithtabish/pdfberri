// src/app/tools/edit-pdf/page.tsx

import type { Metadata } from 'next';
import { EditPdfPage } from '@/components/pages/tools/edit-pdf/edit-pdf-page';

const SITE_URL = 'https://pdfberri.com'; // ← change to your real domain
const PATH = '/tools/edit-pdf';
const CANONICAL = `${SITE_URL}${PATH}`;

export const metadata: Metadata = {
  title: 'Edit PDF Online Free — Add Text, Images & Signatures | PDFBerri',
  description:
    'Edit PDF files directly in your browser. Add text, images, shapes, comments, and signatures. All processing happens locally — your PDF never leaves your device.',
  keywords: [
    'edit pdf',
    'pdf editor',
    'add text to pdf',
    'sign pdf',
    'annotate pdf',
    'free pdf editor',
    'online pdf editor',
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: 'website',
    url: CANONICAL,
    siteName: 'PDFBerri',
    title: 'Edit PDF Online Free — PDFBerri',
    description:
      'Privacy-first PDF editor. Add text, images, annotations, and signatures without uploading your file.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edit PDF Online Free — PDFBerri',
    description: 'Edit PDFs in your browser. No uploads, no sign-up.',
  },
  robots: { index: true, follow: true },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'PDFBerri – Edit PDF',
      url: CANONICAL,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Edit PDF files in the browser: add text, images, shapes, comments, and signatures.',
      featureList: [
        'Add text',
        'Insert images',
        'Draw shapes and annotations',
        'Add comments',
        'Insert signatures',
        'Rotate and reorder pages',
        'Undo and redo',
        'Download edited PDF',
      ],
      isAccessibleForFree: true,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE_URL}/tools` },
        { '@type': 'ListItem', position: 3, name: 'Edit PDF', item: CANONICAL },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is my PDF uploaded to a server?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. All PDF processing happens locally in your browser. Your file is never sent to any server.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I edit existing text inside a PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can overlay new text on top of existing content. Reliable in-place modification of the original text streams is not supported because of how PDFs store glyphs and fonts.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is redaction secure?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Secure redaction is intentionally disabled in this build. A black rectangle over content does not remove the underlying text and is not a secure redaction.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is the signature legally binding?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Signatures placed here are visual image stamps, not certificate-based digital signatures. They do not provide cryptographic non-repudiation.',
          },
        },
      ],
    },
  ],
};

export default function EditPdfRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <EditPdfPage />
    </>
  );
}