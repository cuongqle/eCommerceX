import { describe, expect, it } from "vitest";
import { addCartItemSchema, updateCartItemSchema } from "./cart.schema";

describe("addCartItemSchema", () => {
  it("defaults quantity to 1", () => {
    expect(addCartItemSchema.parse({ body: { productId: "p1" } }).body.quantity).toBe(1);
  });

  it("rejects a zero quantity", () => {
    expect(addCartItemSchema.safeParse({ body: { productId: "p1", quantity: 0 } }).success).toBe(false);
  });
});

describe("updateCartItemSchema", () => {
  it("requires a positive integer quantity", () => {
    expect(updateCartItemSchema.safeParse({ body: { quantity: 2 } }).success).toBe(true);
    expect(updateCartItemSchema.safeParse({ body: { quantity: 0 } }).success).toBe(false);
  });
});
