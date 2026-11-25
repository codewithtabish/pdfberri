export function RearrangePagesFaq() {
  const faqs = [
    { q: 'How do I rearrange PDF pages?', a: 'Upload your PDF, simply click and drag the pages to put them in the order you want, then click Rearrange PDF and download.' },
    { q: 'Will this change my original file?', a: 'No. Your original PDF is never modified. We generate a brand new, perfectly arranged PDF for you to download.' },
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