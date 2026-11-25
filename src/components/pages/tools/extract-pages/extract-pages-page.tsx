import { ExtractPagesWorkspace } from './extract-pages-workspace';

export function ExtractPagesPage() {
  return (
    <div className="flex flex-col gap-10 py-6 sm:py-8 lg:py-10">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Extract PDF Pages
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Select the pages you need and create a new PDF containing only those pages.
        </p>
      </header>
      <section>
        <ExtractPagesWorkspace />
      </section>
    </div>
  );
}