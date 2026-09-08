"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { destroyProductImage, uploadProductImage } from "@/lib/uploads";

export function SettingsImage({
  token,
  label,
  hint,
  value,
  onChange,
  previewClassName,
  fallbackSrc,
}: {
  token: string;
  label: string;
  hint: string;
  value: string;
  onChange: (url: string) => void;
  previewClassName?: string;
  fallbackSrc?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const previous = value;
      const uploaded = await uploadProductImage(file, token);
      onChange(uploaded);
      if (previous) {
        await destroyProductImage(previous, token).catch(() => undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    setError(null);
    try {
      if (value) await destroyProductImage(value, token);
    } catch {
      // Keep the form usable if Cloudinary delete fails.
    }
    onChange("");
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => onFile(event.target.files)}
      />
      {value || fallbackSrc ? (
        <div className="flex items-center gap-4">
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value || fallbackSrc}
              alt=""
              className={previewClassName ?? "size-full object-contain p-1"}
            />
          </div>
          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={remove} aria-label={`Remove ${label}`}>
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">Default mark</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No {label.toLowerCase()} yet.</p>
      )}
      <Button type="button" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
        <ImagePlus />
        {uploading ? "Uploading..." : value ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
      </Button>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
