export function DeletePagesFaq() {
  const faqs = [
    { q: 'How do I delete pages from a PDF?', a: 'Upload your PDF, select the pages you want to remove, and click Delete Pages. We will generate a new PDF without those pages.' },
    { q: 'Does this modify my original PDF?', a: 'No. We create a brand new PDF file. Your original document is never modified or overwritten.' },
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