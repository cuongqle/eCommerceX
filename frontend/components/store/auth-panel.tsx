"use client";

import type { ReactNode } from "react";
import { StoreBrand } from "@/components/store/store-brand";
import { useStoreSettings } from "@/components/store/store-settings-provider";

export function AuthPanel({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const settings = useStoreSettings();

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-6xl lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-zinc-950 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-zinc-950/45" />
        <div className="relative flex h-full flex-col justify-end p-10 text-white">
          <p className="text-[11px] tracking-[0.2em] uppercase text-white/70">
            <StoreBrand name={settings.name} logoUrl={settings.logoUrl} iconUrl={settings.iconUrl} iconClassName="size-6" />
          </p>
          <p className="mt-3 max-w-sm text-2xl font-semibold tracking-tight">
            {settings.tagline || "A quieter way to shop the house edit."}
          </p>
        </div>
      </div>
      <div className="flex items-center px-4 py-16 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">{kicker}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
