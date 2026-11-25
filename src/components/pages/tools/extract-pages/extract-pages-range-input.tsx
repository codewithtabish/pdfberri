export function ExtractPagesRangeInput({ onChange }: { onChange: (val: string) => void }) {
  return <input type="text" placeholder="e.g. 1, 3, 5-8" onChange={(e) => onChange(e.target.value)} className="rounded border px-2 py-1 text-sm w-32" />;
}