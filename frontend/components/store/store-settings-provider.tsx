"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_STORE_SETTINGS } from "@/lib/store-settings";
import type { StoreSettings } from "@/lib/types";

const StoreSettingsContext = createContext<StoreSettings>(DEFAULT_STORE_SETTINGS);

export function StoreSettingsProvider({
  settings,
  children,
}: {
  settings: StoreSettings;
  children: ReactNode;
}) {
  return <StoreSettingsContext.Provider value={settings}>{children}</StoreSettingsContext.Provider>;
}

export function useStoreSettings(): StoreSettings {
  return useContext(StoreSettingsContext);
}
