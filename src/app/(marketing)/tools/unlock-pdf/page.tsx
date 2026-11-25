// src/app/tools/unlock-pdf/page.tsx

import type { Metadata } from "next";
import { UnlockPdf } from "@/components/pages/tools/unlock-pdf";

export const metadata: Metadata = {
  title: "Unlock PDF — Remove Password Protection | PDFBerri",
  description:
    "Remove password protection from your PDF and access your document without entering the password every time. Secure, local, and fast.",
  alternates: { canonical: "/tools/unlock-pdf" },
  openGraph: {
    title: "Unlock PDF — Remove Password Protection | PDFBerri",
    description:
      "Remove password protection from your PDF and access your document without entering the password every time.",
    url: "/tools/unlock-pdf",
    type: "website",
  },
};

export default function UnlockPdfPage() {
  return <UnlockPdf />;
}