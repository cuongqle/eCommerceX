"use client";

import Link from "next/link";
import { StoreBrand } from "@/components/store/store-brand";
import { useStoreSettings } from "@/components/store/store-settings-provider";
import { useSession } from "@/components/session-provider";

export function StoreFooter() {
  const { storeUser, signOut } = useSession();
  const settings = useStoreSettings();

  return (
    <footer className="mt-auto shrink-0 border-t border-border/70 bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:grid-cols-3">
        <div>
          <p className="text-sm font-semibold tracking-tight">
            <StoreBrand
              name={settings.name}
              logoUrl={settings.logoUrl}
              iconUrl={settings.iconUrl}
              imageClassName="h-6"
              iconClassName="size-6"
            />
          </p>
          {settings.tagline ? (
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{settings.tagline}</p>
          ) : null}
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">Shop</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/#catalog" className="text-foreground/80 hover:underline">
              Collection
            </Link>
            <Link href="/cart" className="text-foreground/80 hover:underline">
              Bag
            </Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">Account</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {storeUser ? (
              <>
                <Link href="/orders" className="text-foreground/80 hover:underline">
                  Orders
                </Link>
                <button type="button" className="text-left text-foreground/80 hover:underline" onClick={() => signOut("store")}>
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login" className="text-foreground/80 hover:underline">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-border/70">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {settings.name}
        </p>
      </div>
    </footer>
  );
}
