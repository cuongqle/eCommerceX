import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../models/Settings", () => ({
  STORE_SETTINGS_KEY: "store",
  DEFAULT_STORE_SETTINGS: {
    singleton: "store",
    name: "eCommerceX",
    tagline: "A considered edit of apparel, electronics, and home.",
    announcement: "Complimentary shipping on every preview order",
    logoUrl: "",
    iconUrl: "",
  },
  Settings: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

import { Settings } from "../../models/Settings";
import { getSettings, toPublicSettings, updateSettings } from "./settings.service";

describe("getSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the existing singleton", async () => {
    const existing = { name: "Oak & Ash" };
    vi.mocked(Settings.findOne).mockResolvedValue(existing as never);
    await expect(getSettings()).resolves.toEqual(existing);
    expect(Settings.create).not.toHaveBeenCalled();
  });

  it("creates defaults when none exist", async () => {
    const created = { name: "eCommerceX" };
    vi.mocked(Settings.findOne).mockResolvedValue(null);
    vi.mocked(Settings.create).mockResolvedValue(created as never);
    await expect(getSettings()).resolves.toEqual(created);
    expect(Settings.create).toHaveBeenCalled();
  });
});

describe("updateSettings", () => {
  it("trims and saves patched fields", async () => {
    const settings = {
      name: "eCommerceX",
      tagline: "",
      announcement: "",
      logoUrl: "",
      iconUrl: "",
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(Settings.findOne).mockResolvedValue(settings as never);

    await updateSettings({
      name: "  Oak & Ash  ",
      logoUrl: " https://cdn.example/logo.png ",
    });

    expect(settings.name).toBe("Oak & Ash");
    expect(settings.logoUrl).toBe("https://cdn.example/logo.png");
    expect(settings.save).toHaveBeenCalled();
  });
});

describe("toPublicSettings", () => {
  it("omits internal fields", () => {
    expect(
      toPublicSettings({
        singleton: "store",
        name: "Oak",
        tagline: "Quiet goods",
        announcement: "Free shipping",
        logoUrl: "https://cdn.example/logo.png",
        iconUrl: "",
      } as never)
    ).toEqual({
      name: "Oak",
      tagline: "Quiet goods",
      announcement: "Free shipping",
      logoUrl: "https://cdn.example/logo.png",
      iconUrl: "",
    });
  });
});
