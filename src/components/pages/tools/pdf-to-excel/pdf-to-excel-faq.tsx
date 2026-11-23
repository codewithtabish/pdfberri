'use client';

import { ChevronDownIcon, ChevronUpIcon, InfoIcon } from '@/components/general/icons/pdf-icons';
import { useState } from 'react';

export function PdfToExcelFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does PDF to Excel conversion work?',
      a: 'We extract the text and positional data from your PDF, analyze the layout to identify rows and columns, and reconstruct the table structure into a native Excel workbook.'
    },
    {
      q: 'Are my files secure?',
      a: 'Yes. All processing happens directly in your browser. Your PDF is never uploaded to our servers.'
    },
    {
      q: 'Can I convert scanned PDFs?',
      a: 'Currently, we extract text-based tables. If you upload a scanned document, we may not be able to detect tables unless it contains an invisible text layer.'
    }
  ];

  return (
    <div className="mt-12 mb-8">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <InfoIcon className="w-5 h-5 text-primary" />
        Frequently Asked Questions
      </h3>
      <div className="flex flex-col gap-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-border rounded-lg bg-card overflow-hidden">
            <button 
              className="w-full px-4 py-3 flex items-center justify-between text-left font-medium hover:bg-muted/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              {faq.q}
              {openIndex === idx ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
            {openIndex === idx && (
              <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border bg-muted/20">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}