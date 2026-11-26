import JSZip from "jszip";
import type { ExtractedImage } from "./extract-types";

export async function generateImagesZip(images: ExtractedImage[]): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder("extracted-images");
  if (!folder) throw new Error("Could not create ZIP folder.");

  const usedNames = new Set<string>();
  const manifest: Array<Record<string, unknown>> = [];

  for (const img of images) {
    let name = img.fileName.replace(/[\\/]/g, "_");
    let counter = 1;
    while (usedNames.has(name)) {
      name = img.fileName.replace(/(\.[^.]+)$/, `_${counter}$1`);
      counter++;
    }
    usedNames.add(name);

    folder.file(name, img.blob);
    manifest.push({
      fileName: name,
      pages: img.pages,
      width: img.width,
      height: img.height,
      format: img.format,
      sizeBytes: img.size,
    });
  }

  folder.file("manifest.json", JSON.stringify(manifest, null, 2));

  return await zip.generateAsync({ type: "blob" });
}