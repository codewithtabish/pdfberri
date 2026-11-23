"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function HtmlToPdfCodeInput({ value, onChange, disabled }: Props) {
  return (
    <div className="space-y-2">
      <label htmlFor="html-code" className="sr-only">
        Paste HTML code
      </label>
      <textarea
        id="html-code"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={`<!DOCTYPE html>
<html>
<head>
  <title>My Document</title>
  <style>
    body { font-family: system-ui; }
  </style>
</head>
<body>
  <h1>Hello PDFBerri</h1>
  <p>Paste your HTML here...</p>
</body>
</html>`}
        rows={14}
        className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm leading-relaxed placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        spellCheck={false}
      />
      <p className="text-xs text-muted-foreground">
        Full documents or fragments are accepted. CSS and images will be preserved when possible.
      </p>
    </div>
  );
}
