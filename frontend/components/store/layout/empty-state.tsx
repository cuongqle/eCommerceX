import type { ComponentType } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  href = "/#catalog",
  action = "Continue shopping",
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="flex size-12 items-center justify-center border border-border bg-card">
        <Icon className="size-5" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <Link href={href} className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
        {action}
      </Link>
    </div>
  );
}
