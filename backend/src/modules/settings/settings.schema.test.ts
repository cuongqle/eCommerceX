import { describe, expect, it } from "vitest";
import { updateSettingsSchema } from "./settings.schema";

describe("updateSettingsSchema", () => {
  it("accepts a store name and empty media urls", () => {
    expect(
      updateSettingsSchema.safeParse({
        body: { name: "Oak & Ash", logoUrl: "", iconUrl: "" },
      }).success
    ).toBe(true);
  });

  it("accepts Cloudinary urls", () => {
    expect(
      updateSettingsSchema.safeParse({
        body: {
          logoUrl: "https://res.cloudinary.com/demo/image/upload/logo.png",
          iconUrl: "https://res.cloudinary.com/demo/image/upload/icon.png",
        },
      }).success
    ).toBe(true);
  });

  it("rejects a short name or a non-url logo", () => {
    expect(updateSettingsSchema.safeParse({ body: { name: "X" } }).success).toBe(false);
    expect(updateSettingsSchema.safeParse({ body: { logoUrl: "/local.png" } }).success).toBe(false);
  });
});
