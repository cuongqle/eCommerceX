import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../utils/ApiError";

vi.mock("../../models/Category", () => ({
  Category: {
    findById: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("../../models/Product", () => ({
  Product: {
    create: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

import { Category } from "../../models/Category";
import { Product } from "../../models/Product";
import { createProduct, deleteProduct, getStoreProduct } from "./product.service";

const categoryId = "507f1f77bcf86cd799439011";

const input = {
  name: "Linen Shirt",
  description: "A relaxed everyday shirt.",
  price: 89,
  category: categoryId,
  sku: "lin-001",
  stock: 4,
};

describe("createProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid category id", async () => {
    await expect(createProduct({ ...input, category: "not-an-id" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Invalid category id",
    });
  });

  it("rejects a missing category", async () => {
    vi.mocked(Category.findById).mockResolvedValue(null);
    await expect(createProduct(input)).rejects.toMatchObject({
      statusCode: 404,
      message: "Category not found",
    });
  });

  it("slugifies the name and uppercases the sku", async () => {
    vi.mocked(Category.findById).mockResolvedValue({ _id: categoryId } as never);
    vi.mocked(Product.create).mockResolvedValue({ slug: "linen-shirt" } as never);
    await createProduct(input);
    expect(Product.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "linen-shirt", sku: "LIN-001" })
    );
  });

  it("uses a provided slug", async () => {
    vi.mocked(Category.findById).mockResolvedValue({ _id: categoryId } as never);
    vi.mocked(Product.create).mockResolvedValue({} as never);
    await createProduct({ ...input, slug: "Custom Slug" });
    expect(Product.create).toHaveBeenCalledWith(expect.objectContaining({ slug: "custom-slug" }));
  });
});

describe("getStoreProduct", () => {
  it("throws when the product is missing", async () => {
    vi.mocked(Product.findOne).mockReturnValue({
      populate: vi.fn().mockResolvedValue(null),
    } as never);
    await expect(getStoreProduct("missing")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("deleteProduct", () => {
  it("soft-deletes a product", async () => {
    const deleted = { _id: new Types.ObjectId(), isDeleted: true };
    vi.mocked(Product.findOneAndUpdate).mockResolvedValue(deleted as never);
    await expect(deleteProduct("p1")).resolves.toEqual(deleted);
    expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "p1", isDeleted: false },
      { isDeleted: true, isPublished: false },
      { new: true }
    );
  });

  it("throws when nothing was updated", async () => {
    vi.mocked(Product.findOneAndUpdate).mockResolvedValue(null);
    await expect(deleteProduct("gone")).rejects.toMatchObject({ statusCode: 404 });
  });
});
