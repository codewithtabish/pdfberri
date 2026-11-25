export function ExtractPagesFaq() {
  const faqs = [
    { q: 'How do I extract pages from a PDF?', a: 'Upload your PDF, select the pages you want using our visual grid, and click Extract Pages. You will get a new PDF containing only those pages.' },
    { q: 'Does this modify my original PDF?', a: 'No. We extract the pages into a brand new PDF file. Your original document is never modified or overwritten.' },
  ];
  return (
    <section className="mx-auto w-full max-w-3xl mt-12">
      <h2 className="text-xl font-semibold mb-4 text-center">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {faqs.map(f => (
          <details key={f.q} className="rounded-lg border p-4 cursor-pointer">
            <summary className="font-medium text-sm">{f.q}</summary>
            <p className="text-sm text-muted-foreground mt-2">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}