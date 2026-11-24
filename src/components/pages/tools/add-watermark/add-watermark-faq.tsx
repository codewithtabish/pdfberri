export function AddWatermarkFaq() {
  const faqs = [
    { q: 'What is a watermark in a PDF?', a: 'A watermark is a recognizable image or text superimposed on a document, typically used to identify the creator or indicate confidentiality.' },
    { q: 'Can I add a text watermark?', a: 'Yes, you can add custom text, adjust its font size, color, opacity, and rotation.' },
    { q: 'Can I add my company logo as a watermark?', a: 'Yes, upload a PNG or JPG image and apply it as an image watermark.' }
  ];
  return (
    <div className="mx-auto w-full max-w-3xl mt-12">
      <h2 className="text-xl font-semibold mb-4 text-center">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {faqs.map(f => (
          <details key={f.q} className="rounded-lg border p-4 cursor-pointer">
            <summary className="font-medium text-sm">{f.q}</summary>
            <p className="text-sm text-muted-foreground mt-2">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}