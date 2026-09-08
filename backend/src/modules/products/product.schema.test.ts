import { describe, expect, it } from "vitest";
import { createProductSchema, updateProductSchema } from "./product.schema";

const validBody = {
  name: "Linen Shirt",
  description: "A relaxed everyday shirt.",
  price: 89,
  category: "507f1f77bcf86cd799439011",
  sku: "LIN-001",
  stock: 4,
};

describe("createProductSchema", () => {
  it("accepts a complete product", () => {
    expect(createProductSchema.safeParse({ body: validBody }).success).toBe(true);
  });

  it("rejects a short description, negative price, or fractional stock", () => {
    expect(
      createProductSchema.safeParse({ body: { ...validBody, description: "Too short" } }).success
    ).toBe(false);
    expect(createProductSchema.safeParse({ body: { ...validBody, price: -1 } }).success).toBe(false);
    expect(createProductSchema.safeParse({ body: { ...validBody, stock: 1.5 } }).success).toBe(false);
  });

  it("rejects a non-url image", () => {
    expect(
      createProductSchema.safeParse({ body: { ...validBody, images: ["/local.png"] } }).success
    ).toBe(false);
  });
});

describe("updateProductSchema", () => {
  it("allows a partial body", () => {
    expect(updateProductSchema.safeParse({ body: { price: 12 } }).success).toBe(true);
  });
});
