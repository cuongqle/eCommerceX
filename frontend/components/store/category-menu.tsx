"use client";

import type { CategoryTree } from "@/lib/categories";

export function CategoryMenu({ categories }: { categories: CategoryTree[] }) {
  if (categories.length === 0) return null;

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {categories.map((category) => (
        <div key={category._id} className="group relative">
          <a
            href={`/#${category.slug}`}
            className="inline-flex h-16 items-center text-sm tracking-wide text-foreground/80 hover:text-foreground"
          >
            {category.name}
          </a>
          {category.children.length > 0 ? (
            <div className="invisible absolute left-1/2 top-full z-30 w-60 -translate-x-1/2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="border border-border/70 bg-card py-3 shadow-lg">
                <a href={`/#${category.slug}`} className="block px-4 py-1.5 text-sm font-medium hover:bg-secondary">
                  Shop all {category.name}
                </a>
                <div className="my-2 h-px bg-border" />
                <div className="max-h-72 overflow-y-auto">
                  {category.children.map((child) => (
                    <a
                      key={child._id}
                      href={`/#${child.slug}`}
                      className="block px-4 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      {child.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </nav>
  );
}
