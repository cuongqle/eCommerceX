"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function CategoryNav({ categories }: { categories: Category[] }) {
  const [active, setActive] = useState("catalog");

  useEffect(() => {
    const ids = ["catalog", ...categories.map((category) => category.slug)];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActive(visible.target.id);
        }
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: [0.15, 0.35, 0.6] }
    );

    for (const id of ids) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }

    return () => observer.disconnect();
  }, [categories]);

  const links = [{ slug: "catalog", name: "All" }, ...categories];

  return (
    <nav className="sticky top-24 z-10 border-b border-border/70 bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4">
        <div className="flex gap-6 overflow-x-auto">
          {links.map((item) => (
            <a
              key={item.slug}
              href={`#${item.slug}`}
              className={cn(
                "shrink-0 border-b-2 py-3 text-sm tracking-wide transition-colors",
                active === item.slug
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.name}
            </a>
          ))}
        </div>
        <p className="hidden shrink-0 text-[11px] tracking-[0.14em] text-muted-foreground uppercase sm:block">
          Jump a department
        </p>
      </div>
    </nav>
  );
}
