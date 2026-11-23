"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function HtmlToPdfUrlInput({ value, onChange, disabled }: Props) {
  return (
    <div className="space-y-2">
      <label htmlFor="html-url" className="block text-sm font-medium">
        Webpage URL
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <input
          id="html-url"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="https://example.com/page"
          className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          autoComplete="url"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Public HTTPS pages only. Private networks and localhost are blocked for security. JavaScript is disabled by default.
      </p>
    </div>
  );
}
