import { Button } from "@/components/ui/button";
import { UploadCloudIcon } from "@/components/general/icons/pdf-icons";
import { cn } from "@/lib/utils";

interface HeroDropzoneProps {
  className?: string;
}

/**
 * Hero dropzone — visual placeholder only (no file selection or upload).
 */
export function HeroDropzone({ className }: HeroDropzoneProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-dashed border-primary/40 bg-background/60 px-6 py-8 backdrop-blur-sm transition-colors hover:border-primary/70 sm:py-10",
        className,
      )}
    >
      <div className="flex flex-col items-center">
        <UploadCloudIcon className="size-14 text-primary" />
        <p className="mt-3 text-lg font-bold text-foreground sm:text-xl">
          Drop your files here
        </p>

        <Button
          type="button"
          size="lg"
          className="mt-4 rounded-full px-8 font-semibold"
        >
          Select PDF files
        </Button>

        <p className="mt-4 text-xs text-muted-foreground sm:text-sm">
          Free · No sign-up · Files auto-deleted after 30 minutes
        </p>
      </div>
    </div>
  );
}