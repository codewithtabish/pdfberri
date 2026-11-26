import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Container } from "@/components/site/general/layouts/container";
import Navbar from "@/components/general/navigation/navbar";
import Footer from "@/components/general/navigation/footer";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDFBerri",
  description: "PDFBerri: a modern, friendly and professional PDF experience.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full w-full flex-col overflow-x-clip">
        <Container className="flex-1">
          <Navbar />
          {children}
        </Container>
        <Footer />
      </body>
    </html>
  );
}