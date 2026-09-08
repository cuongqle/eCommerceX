import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../models/Cart", () => ({
  Cart: {
    findOne: vi.fn(),
  },
}));

vi.mock("../../models/Order", () => ({
  Order: {
    create: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock("../../models/Product", () => ({
  Product: {
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
    find: vi.fn(),
  },
}));

import { Cart } from "../../models/Cart";
import { Order } from "../../models/Order";
import { Product } from "../../models/Product";
import { createOrder, getMyOrder, updateOrderStatus } from "./order.service";

const userId = "507f191e810c19729de860ea";
const productId = "507f1f77bcf86cd799439011";
const address = {
  fullName: "Jane Customer",
  phone: "5551234567",
  line1: "12 Oak Street",
  city: "Portland",
  postalCode: "97201",
  country: "US",
};

describe("createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an empty cart", async () => {
    vi.mocked(Cart.findOne).mockResolvedValue(null);
    await expect(createOrder(userId, address)).rejects.toMatchObject({
      statusCode: 400,
      message: "Cart is empty",
    });
  });

  it("rolls stock back when a later line cannot be reserved", async () => {
    const cart = {
      items: [
        { product: { toString: () => productId }, quantity: 1 },
        { product: { toString: () => "507f1f77bcf86cd799439099" }, quantity: 1 },
      ],
      save: vi.fn(),
    };
    vi.mocked(Cart.findOne).mockResolvedValue(cart as never);
    vi.mocked(Product.findOneAndUpdate)
      .mockResolvedValueOnce({
        _id: productId,
        name: "Shirt",
        slug: "shirt",
        images: ["https://img/s.jpg"],
        price: 40,
      } as never)
      .mockResolvedValueOnce(null);
    vi.mocked(Product.updateOne).mockResolvedValue({} as never);

    await expect(createOrder(userId, address)).rejects.toMatchObject({
      message: "A product is unavailable or does not have enough stock",
    });
    expect(Product.updateOne).toHaveBeenCalledWith({ _id: productId }, { $inc: { stock: 1 } });
    expect(Order.create).not.toHaveBeenCalled();
  });

  it("creates the order, decrements stock, and clears the cart", async () => {
    const cart = {
      items: [{ product: { toString: () => productId }, quantity: 2 }],
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(Cart.findOne).mockResolvedValue(cart as never);
    vi.mocked(Product.findOneAndUpdate).mockResolvedValue({
      _id: productId,
      name: "Shirt",
      slug: "shirt",
      images: ["https://img/s.jpg"],
      price: 40,
    } as never);
    const created = { id: "order-1" };
    vi.mocked(Order.create).mockResolvedValue(created as never);

    await expect(createOrder(userId, address, 5)).resolves.toEqual(created);
    expect(Order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: userId,
        subtotal: 80,
        shippingFee: 5,
        total: 85,
        status: "pending",
        paymentStatus: "unpaid",
        items: [
          expect.objectContaining({
            name: "Shirt",
            slug: "shirt",
            image: "https://img/s.jpg",
            price: 40,
            quantity: 2,
          }),
        ],
      })
    );
    expect(cart.items).toEqual([]);
    expect(cart.save).toHaveBeenCalled();
  });
});

describe("getMyOrder", () => {
  it("throws when the order does not belong to the user", async () => {
    vi.mocked(Order.findOne).mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as never);
    await expect(getMyOrder(userId, "missing")).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("updateOrderStatus", () => {
  it("throws when the order is missing", async () => {
    vi.mocked(Order.findById).mockResolvedValue(null);
    await expect(updateOrderStatus("missing", { status: "shipped" })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("saves status updates", async () => {
    const order = { status: "pending", paymentStatus: "unpaid", save: vi.fn().mockResolvedValue(undefined) };
    vi.mocked(Order.findById).mockResolvedValue(order as never);
    await updateOrderStatus("o1", { status: "shipped", paymentStatus: "paid" });
    expect(order.status).toBe("shipped");
    expect(order.paymentStatus).toBe("paid");
    expect(order.save).toHaveBeenCalled();
  });
});
