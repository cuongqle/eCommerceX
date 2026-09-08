"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { CategoryMenu } from "@/components/store/categories/category-menu";
import { StoreBrand } from "@/components/store/settings/store-brand";
import { useStoreSettings } from "@/components/store/settings/store-settings-provider";
import { useSession } from "@/components/session-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import type { CategoryTree } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function StoreHeader({ categories = [] }: { categories?: CategoryTree[] }) {
  const { storeUser, cartCount, signOut } = useSession();
  const settings = useStoreSettings();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20">
      {settings.announcement ? (
        <p className="border-b border-border/70 bg-secondary/80 px-4 py-1.5 text-center text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          {settings.announcement}
        </p>
      ) : null}
      <div className="border-b border-border/70 bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X /> : <Menu />}
            </Button>
            <Link href="/" className="text-[17px] font-semibold tracking-tight" onClick={() => setOpen(false)}>
              <StoreBrand name={settings.name} logoUrl={settings.logoUrl} iconUrl={settings.iconUrl} />
            </Link>
          </div>
          <CategoryMenu categories={categories} />
          <nav className="flex items-center gap-0.5">
            <Link href="/cart" className={cn(buttonVariants({ variant: "ghost" }), "relative px-2.5")}>
              <span className="relative">
                <ShoppingBag />
                {cartCount > 0 ? (
                  <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                ) : null}
              </span>
              <span className="sr-only sm:not-sr-only sm:ml-1">Bag</span>
            </Link>
            {storeUser ? (
              <>
                <Link href="/orders" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}>
                  Orders
                </Link>
                <Button variant="ghost" onClick={() => signOut("store")}>
                  Sign out
                </Button>
              </>
            ) : (
              <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                Sign in
              </Link>
            )}
          </nav>
        </div>
        {open ? (
          <div className="border-t border-border/70 md:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3">
              {categories.map((category) => (
                <div key={category._id} className="border-b border-border/60 py-3 last:border-b-0">
                  <a
                    href={`/#${category.slug}`}
                    className="text-sm font-medium"
                    onClick={() => setOpen(false)}
                  >
                    {category.name}
                  </a>
                  {category.children.length > 0 ? (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {category.children.map((child) => (
                        <a
                          key={child._id}
                          href={`/#${child.slug}`}
                          className="text-sm text-muted-foreground"
                          onClick={() => setOpen(false)}
                        >
                          {child.name}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {storeUser ? (
                <Link href="/orders" className="py-3 text-sm" onClick={() => setOpen(false)}>
                  Orders
                </Link>
              ) : null}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
