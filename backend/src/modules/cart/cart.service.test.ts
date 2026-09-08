import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../models/Cart", () => ({
  Cart: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../models/Product", () => ({
  Product: {
    findOne: vi.fn(),
    findById: vi.fn(),
  },
}));

import { Cart } from "../../models/Cart";
import { Product } from "../../models/Product";
import { addItem, removeItem, updateItem } from "./cart.service";

const productId = "507f1f77bcf86cd799439011";
const userId = "507f191e810c19729de860ea";

function cartDoc(items: { product: { toString(): string }; quantity: number }[] = []) {
  return {
    items,
    save: vi.fn().mockResolvedValue(undefined),
    populate: vi.fn().mockResolvedValue(undefined),
  };
}

describe("addItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid product id", async () => {
    await expect(addItem(userId, "bad-id", 1)).rejects.toMatchObject({
      statusCode: 400,
      message: "Invalid product id",
    });
  });

  it("rejects a missing published product", async () => {
    vi.mocked(Product.findOne).mockResolvedValue(null);
    await expect(addItem(userId, productId, 1)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rejects when stock is too low", async () => {
    vi.mocked(Product.findOne).mockResolvedValue({ stock: 1 } as never);
    await expect(addItem(userId, productId, 2)).rejects.toMatchObject({
      message: "Not enough stock",
    });
  });

  it("adds a new line and saves", async () => {
    const cart = cartDoc();
    vi.mocked(Product.findOne).mockResolvedValue({ stock: 5 } as never);
    vi.mocked(Cart.findOne).mockResolvedValue(cart as never);
    await addItem(userId, productId, 2);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]?.quantity).toBe(2);
    expect(cart.items[0]?.product).toBeInstanceOf(Types.ObjectId);
    expect(cart.save).toHaveBeenCalled();
  });

  it("increments an existing line when stock allows", async () => {
    const cart = cartDoc([{ product: { toString: () => productId }, quantity: 1 }]);
    vi.mocked(Product.findOne).mockResolvedValue({ stock: 5 } as never);
    vi.mocked(Cart.findOne).mockResolvedValue(cart as never);
    await addItem(userId, productId, 2);
    expect(cart.items[0]?.quantity).toBe(3);
  });

  it("rejects an increment that exceeds stock", async () => {
    const cart = cartDoc([{ product: { toString: () => productId }, quantity: 2 }]);
    vi.mocked(Product.findOne).mockResolvedValue({ stock: 3 } as never);
    vi.mocked(Cart.findOne).mockResolvedValue(cart as never);
    await expect(addItem(userId, productId, 2)).rejects.toMatchObject({ message: "Not enough stock" });
  });
});

describe("updateItem", () => {
  it("throws when the line is missing", async () => {
    vi.mocked(Cart.findOne).mockResolvedValue(cartDoc() as never);
    await expect(updateItem(userId, productId, 1)).rejects.toMatchObject({
      message: "Item is not in the cart",
    });
  });

  it("updates quantity when stock is available", async () => {
    const cart = cartDoc([{ product: { toString: () => productId }, quantity: 1 }]);
    vi.mocked(Cart.findOne).mockResolvedValue(cart as never);
    vi.mocked(Product.findById).mockResolvedValue({ stock: 8 } as never);
    await updateItem(userId, productId, 4);
    expect(cart.items[0]?.quantity).toBe(4);
  });
});

describe("removeItem", () => {
  it("drops the matching line", async () => {
    const cart = cartDoc([
      { product: { toString: () => productId }, quantity: 1 },
      { product: { toString: () => "507f1f77bcf86cd799439012" }, quantity: 2 },
    ]);
    vi.mocked(Cart.findOne).mockResolvedValue(cart as never);
    await removeItem(userId, productId);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]?.product.toString()).toBe("507f1f77bcf86cd799439012");
  });
});
