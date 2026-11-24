export function AddWatermarkImageSettings({ config, onImageLoad }: { config: any, onImageLoad: (f: File) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <input type="file" accept="image/png, image/jpeg" onChange={e => e.target.files?.length && onImageLoad(e.target.files[0])} className="text-sm" />
      {config.imageFile && <p className="text-xs text-muted-foreground">Loaded: {config.imageFile.name}</p>}
    </div>
  );
}