"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  if (!current) {
    return (
      <div className="overflow-hidden bg-muted">
        <ProductImage alt={name} className="aspect-square w-full" />
      </div>
    );
  }

  function go(delta: number) {
    setActive((index) => (index + delta + images.length) % images.length);
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden bg-muted">
        <ProductImage src={current} alt={`${name} ${active + 1}`} className="aspect-square w-full" />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center bg-background/90"
              onClick={() => go(-1)}
              aria-label="Previous image"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center bg-background/90"
              onClick={() => go(1)}
              aria-label="Next image"
            >
              <ChevronRight className="size-4" />
            </button>
            <p className="absolute bottom-3 right-3 bg-background/90 px-2.5 py-1 text-xs">
              {active + 1} / {images.length}
            </p>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "overflow-hidden border transition-colors",
                index === active ? "border-foreground" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <ProductImage src={image} alt={`${name} thumbnail ${index + 1}`} className="aspect-square w-full" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
