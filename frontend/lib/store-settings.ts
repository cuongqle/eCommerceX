import { api } from "@/lib/api";
import type { StoreSettings } from "@/lib/types";

export const DEFAULT_STORE_ICON = "/favicon.svg";

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  name: "eCommerceX",
  tagline: "A considered edit of apparel, electronics, and home.",
  announcement: "Complimentary shipping on every preview order",
  logoUrl: "",
  iconUrl: "",
};

export function mergeStoreSettings(partial?: Partial<StoreSettings> | null): StoreSettings {
  return { ...DEFAULT_STORE_SETTINGS, ...partial };
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const data = await api<{ settings: StoreSettings }>("/store/settings");
    return mergeStoreSettings(data.settings);
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}
