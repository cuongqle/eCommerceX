"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export const NO_IMAGE_SRC = "/no-image.svg";

export function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = src && !failed ? src : NO_IMAGE_SRC;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={src && !failed ? alt : "No image"}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
