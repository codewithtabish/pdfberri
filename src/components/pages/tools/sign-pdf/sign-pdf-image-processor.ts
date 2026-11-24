export async function processUploadedSignature(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject("Invalid image");
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject("Failed to read file");
    reader.readAsDataURL(file);
  });
}