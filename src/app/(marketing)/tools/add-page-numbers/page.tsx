// src/app/tools/add-page-numbers/page.tsx

import type { Metadata } from 'next';
import { AddPageNumbersPage } from '@/components/pages/tools/add-page-numbers/add-page-numbers-page';

const SITE_URL = 'https://pdfberri.com'; // Change this to your actual domain
const PATH = '/tools/add-page-numbers';
const CANONICAL = `${SITE_URL}${PATH}`;

export const metadata: Metadata = {
  title: 'Add Page Numbers to PDF Online - PDFBerri',
  description:
    'Add page numbers to your PDF easily. Choose the position, numbering format, starting number, and appearance with PDFBerri.',
  keywords: [
    'add page numbers to pdf',
    'pdf page numbers',
    'number pdf pages',
    'pdf pagination',
    'free pdf tools',
  ],
  alternates: {
    canonical: CANONICAL,
  },
  openGraph: {
    type: 'website',
    url: CANONICAL,
    siteName: 'PDFBerri',
    title: 'Add Page Numbers to PDF Online - PDFBerri',
    description:
      'Add page numbers to your PDF easily. Choose the position, numbering format, starting number, and appearance with PDFBerri.',
  },
  twitter: {
    card: 'summary',
    title: 'Add Page Numbers to PDF Online - PDFBerri',
    description: 'Add page numbers to your PDF easily with PDFBerri.',
  },
  robots: { index: true, follow: true },
};

export default function AddPageNumbersRoute() {
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebApplication',
                name: 'PDFBerri - Add Page Numbers',
                url: CANONICAL,
                applicationCategory: 'UtilitiesApplication',
                operatingSystem: 'Any',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                },
                description:
                  'Add page numbers to your PDF easily. Choose the position, numbering format, starting number, and appearance.',
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: SITE_URL,
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Tools',
                    item: `${SITE_URL}/tools`,
                  },
                  {
                    '@type': 'ListItem',
                    position: 3,
                    name: 'Add Page Numbers',
                    item: CANONICAL,
                  },
                ],
              },
            ],
          }),
        }}
      />

      {/* The actual tool component */}
      <AddPageNumbersPage />
    </>
  );
}