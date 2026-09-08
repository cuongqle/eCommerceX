"use client";

import { useRef, useState } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { destroyProductImage, uploadProductImage } from "@/lib/uploads";

const MAX_IMAGES = 8;

export function ProductImages({
  token,
  images,
  onChange,
}: {
  token: string;
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const remaining = MAX_IMAGES - images.length;
    const files = Array.from(fileList).slice(0, remaining);
    if (files.length === 0) {
      setError(`You can add up to ${MAX_IMAGES} images`);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        uploaded.push(await uploadProductImage(file, token));
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(url: string) {
    setError(null);
    try {
      await destroyProductImage(url, token);
    } catch {
      // Keep the form usable if Cloudinary delete fails (e.g. seed Unsplash URLs).
    }
    onChange(images.filter((image) => image !== url));
  }

  function setCover(url: string) {
    onChange([url, ...images.filter((image) => image !== url)]);
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={(event) => onFiles(event.target.files)}
      />

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, index) => (
            <li key={url} className="overflow-hidden rounded-lg border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between gap-1 bg-card px-2 py-1.5">
                <p className="text-[11px] text-muted-foreground">{index === 0 ? "Cover" : `Image ${index + 1}`}</p>
                <div className="flex gap-1">
                  {index !== 0 ? (
                    <Button type="button" variant="ghost" size="icon-xs" onClick={() => setCover(url)} aria-label="Set as cover">
                      <Star className="size-3.5" />
                    </Button>
                  ) : null}
                  <Button type="button" variant="ghost" size="icon-xs" onClick={() => remove(url)} aria-label="Remove image">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No photos yet. The first upload becomes the cover.</p>
      )}

      <Button
        type="button"
        variant="outline"
        disabled={uploading || images.length >= MAX_IMAGES}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus />
        {uploading ? "Uploading..." : "Upload images"}
      </Button>
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP, or GIF · up to 8 MB each · {images.length}/{MAX_IMAGES}</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
