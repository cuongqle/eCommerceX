"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, FolderTree, LayoutDashboard, Package, Settings, ShoppingCart, Users } from "lucide-react";
import { StoreBrand } from "@/components/store/store-brand";
import { useSession } from "@/components/session-provider";
import { Button } from "@/components/ui/button";
import { DEFAULT_STORE_SETTINGS, fetchStoreSettings } from "@/lib/store-settings";
import type { StoreSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href));
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, adminToken, ready, signOut } = useSession();
  const [brand, setBrand] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    if (ready && !adminToken) {
      router.replace("/admin/login");
    }
  }, [ready, adminToken, router]);

  useEffect(() => {
    fetchStoreSettings().then(setBrand);
  }, [pathname]);

  if (!ready || !adminToken) {
    return (
      <div className="flex min-h-dvh flex-1 items-center justify-center text-sm text-muted-foreground">
        Checking admin session...
      </div>
    );
  }

  const initials = (adminUser?.name ?? "A")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="admin-theme min-h-dvh flex-1 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-border bg-card lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0">
        <div className="px-5 py-5">
          <Link href="/admin" className="block">
            <p className="text-[11px] tracking-[0.16em] text-primary uppercase">
              <StoreBrand
                name={brand.name}
                logoUrl={brand.logoUrl}
                iconUrl={brand.iconUrl}
                className="uppercase"
                imageClassName="h-5"
                iconClassName="size-5"
              />
            </p>
            <p className="mt-1 text-sm font-semibold tracking-tight">Console</p>
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                isActive(pathname, link.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-4 lg:block">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{adminUser?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{adminUser?.email}</p>
            </div>
          </div>
          <div className="mt-0 flex items-center gap-2 lg:mt-4">
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              View store
              <ExternalLink className="size-3" />
            </Link>
            <Button variant="outline" size="sm" onClick={() => signOut("admin")}>
              Sign out
            </Button>
          </div>
        </div>
      </aside>
      <main className="min-w-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
