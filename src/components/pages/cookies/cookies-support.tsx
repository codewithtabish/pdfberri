import Link from "next/link";
import { MailIcon, ShieldCheckIcon, ChevronRightIcon } from "@/components/general/icons/pdf-icons";

export function CookiesSupport() {
  return (
    <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Questions Box */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8">
          <div>
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MailIcon className="size-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Questions About Cookies?</h2>
            <p className="mt-2 text-muted-foreground">
              If you have questions about how PDFBerri uses cookies and similar technologies, our team is here to help.
            </p>
          </div>
          <Link 
            href="/contact" 
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Contact Support
          </Link>
        </div>

        {/* Related Legal Box */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8">
          <div>
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheckIcon className="size-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Related Legal Documents</h2>
            <p className="mt-2 text-muted-foreground">
              Review our other policies to understand how we protect your data and govern our platform.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/privacy" className="group flex items-center justify-between rounded-lg border border-border p-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50">
              Privacy Policy
              <ChevronRightIcon className="size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
            <Link href="/terms" className="group flex items-center justify-between rounded-lg border border-border p-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50">
              Terms of Service
              <ChevronRightIcon className="size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}