import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates words", () => {
    expect(slugify("Linen Shirt")).toBe("linen-shirt");
  });

  it("strips leading and trailing punctuation", () => {
    expect(slugify("  --Autumn Lookbook--  ")).toBe("autumn-lookbook");
  });

  it("drops characters outside a-z and 0-9", () => {
    expect(slugify("Café No. 5!")).toBe("caf-no-5");
  });

  it("collapses repeated separators", () => {
    expect(slugify("oak   &   ash")).toBe("oak-ash");
  });
});
