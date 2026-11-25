import { ExtractPagesThumbnail } from './extract-pages-thumbnail';

export function ExtractPagesThumbnailGrid({ bytes, pageCount, selectedIndices, onToggle }: any) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: pageCount }).map((_, i) => (
        <ExtractPagesThumbnail key={i} bytes={bytes} index={i} isSelected={selectedIndices.includes(i)} onToggle={() => onToggle(i)} />
      ))}
    </div>
  );
}