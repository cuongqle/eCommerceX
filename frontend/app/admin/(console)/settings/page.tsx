"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/panel";
import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsImage } from "@/components/admin/settings-image";
import { useSession } from "@/components/session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { DEFAULT_STORE_SETTINGS, mergeStoreSettings } from "@/lib/store-settings";
import type { StoreSettings } from "@/lib/types";

export default function AdminSettingsPage() {
  const { adminToken } = useSession();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!adminToken) return;
    api<{ settings: StoreSettings }>("/admin/settings", { token: adminToken })
      .then((data) => setSettings(mergeStoreSettings(data.settings)))
      .catch(() => setSettings(DEFAULT_STORE_SETTINGS));
  }, [adminToken]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adminToken || !settings) return;
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const data = await api<{ settings: StoreSettings }>("/admin/settings", {
        method: "PATCH",
        token: adminToken,
        body: {
          name: settings.name,
          tagline: settings.tagline,
          announcement: settings.announcement,
          logoUrl: settings.logoUrl,
          iconUrl: settings.iconUrl,
        },
      });
      setSettings(mergeStoreSettings(data.settings));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings");
    } finally {
      setPending(false);
    }
  }

  if (!settings || !adminToken) {
    return <p className="text-sm text-muted-foreground">Loading settings...</p>;
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Store"
        title="Settings"
        description="Name, announcement, and brand marks shown on the storefront."
      />
      <form className="grid gap-6 lg:grid-cols-2" onSubmit={onSubmit}>
        <AdminPanel title="Identity" description="Appears in the header, footer, tab title, and login panels.">
          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <Label htmlFor="name">Store name</Label>
              <Input
                id="name"
                value={settings.name}
                minLength={2}
                maxLength={80}
                required
                onChange={(event) => setSettings({ ...settings, name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea
                id="tagline"
                value={settings.tagline}
                maxLength={160}
                onChange={(event) => setSettings({ ...settings, tagline: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement">Announcement bar</Label>
              <Input
                id="announcement"
                value={settings.announcement}
                maxLength={160}
                onChange={(event) => setSettings({ ...settings, announcement: event.target.value })}
              />
              <p className="text-xs text-muted-foreground">Leave empty to hide the bar above the header.</p>
            </div>
          </div>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel title="Logo" description="Header and footer. Shown instead of the store name.">
            <div className="p-5">
              <SettingsImage
                token={adminToken}
                label="Logo"
                hint="JPG, PNG, WebP, or GIF · up to 8 MB · wide wordmarks work best"
                value={settings.logoUrl}
                onChange={(logoUrl) => setSettings({ ...settings, logoUrl })}
                previewClassName="max-h-16 w-auto object-contain"
              />
            </div>
          </AdminPanel>
          <AdminPanel title="Icon" description="Browser tab favicon. Use a square image.">
            <div className="p-5">
              <SettingsImage
                token={adminToken}
                label="Icon"
                hint="JPG, PNG, WebP, or GIF · up to 8 MB · 32×32 or 64×64 is enough. Leave empty to keep the default X mark."
                value={settings.iconUrl}
                onChange={(iconUrl) => setSettings({ ...settings, iconUrl })}
                previewClassName="size-12 object-contain"
                fallbackSrc="/favicon.svg"
              />
            </div>
          </AdminPanel>
        </div>

        <div className="lg:col-span-2 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save settings"}
          </Button>
          {saved ? <p className="text-sm text-muted-foreground">Saved. Open the store to see the new brand.</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </form>
    </div>
  );
}
