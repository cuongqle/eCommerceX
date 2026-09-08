import { describe, expect, it } from "vitest";
import { createOrderSchema, updateOrderStatusSchema } from "./order.schema";

const shippingAddress = {
  fullName: "Jane Customer",
  phone: "5551234567",
  line1: "12 Oak Street",
  city: "Portland",
  postalCode: "97201",
  country: "US",
};

describe("createOrderSchema", () => {
  it("accepts a shipping address", () => {
    expect(createOrderSchema.safeParse({ body: { shippingAddress } }).success).toBe(true);
  });

  it("rejects a short phone or negative shipping fee", () => {
    expect(
      createOrderSchema.safeParse({
        body: { shippingAddress: { ...shippingAddress, phone: "12" } },
      }).success
    ).toBe(false);
    expect(
      createOrderSchema.safeParse({ body: { shippingAddress, shippingFee: -1 } }).success
    ).toBe(false);
  });
});

describe("updateOrderStatusSchema", () => {
  it("accepts known statuses", () => {
    expect(
      updateOrderStatusSchema.safeParse({ body: { status: "shipped", paymentStatus: "paid" } }).success
    ).toBe(true);
  });

  it("rejects an unknown status", () => {
    expect(updateOrderStatusSchema.safeParse({ body: { status: "lost" } }).success).toBe(false);
  });
});
