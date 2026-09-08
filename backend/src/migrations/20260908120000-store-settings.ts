import { ensureDefaultSettings } from "../modules/settings/settings.service";

export async function up(): Promise<void> {
  await ensureDefaultSettings();
}

export async function down(): Promise<void> {
  // Keep store branding; settings are upserted and user-owned.
}
