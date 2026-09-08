import type { Metadata } from "next";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { StoreSettingsProvider } from "@/components/store/store-settings-provider";
import { api } from "@/lib/api";
import { nestCategories } from "@/lib/categories";
import { fetchStoreSettings } from "@/lib/store-settings";
import type { Category } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchStoreSettings();
  return {
    title: settings.name,
    description: settings.tagline || undefined,
    icons: { icon: settings.iconUrl || "/favicon.svg" },
  };
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([
    fetchStoreSettings(),
    api<{ categories: Category[] }>("/store/categories")
      .then((data) => data.categories)
      .catch(() => [] as Category[]),
  ]);

  return (
    <StoreSettingsProvider settings={settings}>
      <div className="store-theme flex min-h-dvh flex-1 flex-col">
        <StoreHeader categories={nestCategories(categories)} />
        <div className="flex-1">{children}</div>
        <StoreFooter />
      </div>
    </StoreSettingsProvider>
  );
}
