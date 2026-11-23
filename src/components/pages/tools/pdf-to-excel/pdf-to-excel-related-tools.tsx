'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PDF_TOOL_ICONS } from '@/components/general/icons/pdf-icons';

const RELATED_TOOLS = [
  { name: 'Excel to PDF', slug: 'excel-to-pdf', desc: 'Convert spreadsheets to PDF.' },
  { name: 'PDF to Word', slug: 'pdf-to-word', desc: 'Turn PDFs into editable documents.' },
  { name: 'Merge PDF', slug: 'merge-pdf', desc: 'Combine multiple PDFs into one.' },
  { name: 'Compress PDF', slug: 'compress-pdf', desc: 'Reduce PDF file size.' },
];

export function PdfToExcelRelatedTools() {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Related Tools</h3>
        <Link href="/tools" className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
          Explore all tools <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {RELATED_TOOLS.map((tool) => {
          const Icon = PDF_TOOL_ICONS[tool.slug as keyof typeof PDF_TOOL_ICONS];
          return (
            <Link 
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                  {Icon ? <Icon className="w-5 h-5 text-primary" /> : <span className="text-xs">?</span>}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{tool.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{tool.desc}</p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}