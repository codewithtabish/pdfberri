import { PdfToExcelWorkspace } from '@/components/pages/tools/pdf-to-excel/pdf-to-excel-workspace';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to Excel Converter – Extract PDF Tables to XLSX | PDFBerri',
  description: 'Convert PDF tables into editable Excel spreadsheets. Extract data, review detected tables, and download your XLSX workbook with PDFBerri.',
  alternates: {
    canonical: '/tools/pdf-to-excel',
  },
  openGraph: {
    title: 'PDF to Excel Converter | PDFBerri',
    description: 'Convert PDF tables into editable Excel spreadsheets. Extract data, review detected tables, and download your XLSX workbook with PDFBerri.',
    url: '/tools/pdf-to-excel',
    siteName: 'PDFBerri',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF to Excel Converter | PDFBerri',
    description: 'Convert PDF tables into editable Excel spreadsheets with PDFBerri.',
  },
};

export default function PdfToExcelPage() {
  return <PdfToExcelWorkspace />;
}