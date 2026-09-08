import { DEFAULT_STORE_ICON } from "@/lib/store-settings";
import { cn } from "@/lib/utils";

export function StoreBrand({
  name,
  logoUrl,
  iconUrl,
  className,
  imageClassName,
  iconClassName,
}: {
  name: string;
  logoUrl?: string;
  iconUrl?: string;
  className?: string;
  imageClassName?: string;
  iconClassName?: string;
}) {
  if (logoUrl) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={name} className={cn("h-7 w-auto max-w-44 object-contain object-left", imageClassName)} />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={iconUrl || DEFAULT_STORE_ICON}
        alt=""
        className={cn("size-7 shrink-0 rounded-md", iconClassName)}
      />
      <span>{name}</span>
    </span>
  );
}
