import { DEFAULT_STORE_SETTINGS, Settings, STORE_SETTINGS_KEY, type ISettings } from "../../models/Settings";

export interface SettingsInput {
  name?: string;
  tagline?: string;
  announcement?: string;
  logoUrl?: string;
  iconUrl?: string;
}

export interface PublicSettings {
  name: string;
  tagline: string;
  announcement: string;
  logoUrl: string;
  iconUrl: string;
}

export function toPublicSettings(settings: ISettings): PublicSettings {
  return {
    name: settings.name,
    tagline: settings.tagline ?? "",
    announcement: settings.announcement ?? "",
    logoUrl: settings.logoUrl ?? "",
    iconUrl: settings.iconUrl ?? "",
  };
}

export async function getSettings() {
  const existing = await Settings.findOne({ singleton: STORE_SETTINGS_KEY });
  if (existing) {
    return existing;
  }
  return Settings.create(DEFAULT_STORE_SETTINGS);
}

export async function updateSettings(input: SettingsInput) {
  const settings = await getSettings();

  if (input.name !== undefined) settings.name = input.name.trim();
  if (input.tagline !== undefined) settings.tagline = input.tagline.trim();
  if (input.announcement !== undefined) settings.announcement = input.announcement.trim();
  if (input.logoUrl !== undefined) settings.logoUrl = input.logoUrl.trim();
  if (input.iconUrl !== undefined) settings.iconUrl = input.iconUrl.trim();

  await settings.save();
  return settings;
}

export async function ensureDefaultSettings() {
  return Settings.findOneAndUpdate(
    { singleton: STORE_SETTINGS_KEY },
    { $setOnInsert: DEFAULT_STORE_SETTINGS },
    { upsert: true, new: true }
  );
}
