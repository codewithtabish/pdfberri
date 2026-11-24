import { AddPageNumbersWorkspace } from './add-page-numbers-workspace';

export function AddPageNumbersPage() {
  return (
    <div className="flex flex-col gap-10 py-6 sm:py-8 lg:py-10">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Add Page Numbers to PDF
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Add page numbers to your PDF in seconds. Choose where they appear and customize their style.
        </p>
      </header>
      <section>
        <AddPageNumbersWorkspace />
      </section>
    </div>
  );
}