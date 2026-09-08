import { Types } from "mongoose";
import { Category } from "../../models/Category";
import { Product } from "../../models/Product";
import { ApiError } from "../../utils/ApiError";
import { paginated, parsePagination } from "../../utils/pagination";
import { slugify } from "../../utils/slug";

interface ProductInput {
  name: string;
  slug?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  category: string;
  sku: string;
  stock: number;
  isPublished?: boolean;
}

interface ProductQuery {
  page?: unknown;
  limit?: unknown;
  q?: unknown;
  category?: unknown;
  published?: unknown;
}

const categoryWithParent = {
  path: "category",
  select: "name slug parent",
  populate: { path: "parent", select: "name slug" },
};

async function assertCategory(categoryId: string) {
  if (!Types.ObjectId.isValid(categoryId)) {
    throw ApiError.badRequest("Invalid category id");
  }
  const category = await Category.findById(categoryId);
  if (!category) {
    throw ApiError.notFound("Category not found");
  }
  return category;
}

export async function listStoreProducts(query: ProductQuery) {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = { isDeleted: false, isPublished: true };

  if (typeof query.q === "string" && query.q.trim()) {
    filter.$text = { $search: query.q.trim() };
  }

  if (typeof query.category === "string" && query.category) {
    const children = await Category.find({ parent: query.category, isActive: true }).select("_id");
    filter.category = { $in: [query.category, ...children.map((child) => child._id)] };
  }

  const [items, total] = await Promise.all([
    Product.find(filter).populate(categoryWithParent).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  return paginated(items, total, page, limit);
}

export async function getStoreProduct(slug: string) {
  const product = await Product.findOne({ slug, isDeleted: false, isPublished: true }).populate(categoryWithParent);
  if (!product) {
    throw ApiError.notFound("Product not found");
  }
  return product;
}

export async function listAdminProducts(query: ProductQuery) {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = { isDeleted: false };

  if (typeof query.q === "string" && query.q.trim()) {
    filter.$or = [
      { name: new RegExp(query.q.trim(), "i") },
      { sku: new RegExp(query.q.trim(), "i") },
    ];
  }

  if (typeof query.category === "string" && query.category) {
    filter.category = query.category;
  }

  if (query.published === "true") filter.isPublished = true;
  if (query.published === "false") filter.isPublished = false;

  const [items, total] = await Promise.all([
    Product.find(filter).populate("category", "name slug parent").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  return paginated(items, total, page, limit);
}

export async function getAdminProduct(id: string) {
  const product = await Product.findOne({ _id: id, isDeleted: false }).populate("category", "name slug parent");
  if (!product) {
    throw ApiError.notFound("Product not found");
  }
  return product;
}

export async function createProduct(input: ProductInput) {
  await assertCategory(input.category);
  const slug = input.slug ? slugify(input.slug) : slugify(input.name);
  return Product.create({
    ...input,
    slug,
    sku: input.sku.toUpperCase(),
  });
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const product = await Product.findOne({ _id: id, isDeleted: false });
  if (!product) {
    throw ApiError.notFound("Product not found");
  }

  if (input.category) {
    await assertCategory(input.category);
    product.category = new Types.ObjectId(input.category);
  }

  if (input.name) product.name = input.name;
  if (input.description) product.description = input.description;
  if (input.price !== undefined) product.price = input.price;
  if (input.compareAtPrice !== undefined) product.compareAtPrice = input.compareAtPrice;
  if (input.images) product.images = input.images;
  if (input.sku) product.sku = input.sku.toUpperCase();
  if (input.stock !== undefined) product.stock = input.stock;
  if (input.isPublished !== undefined) product.isPublished = input.isPublished;
  if (input.slug || input.name) {
    product.slug = slugify(input.slug ?? input.name ?? product.name);
  }

  await product.save();
  return product.populate("category", "name slug parent");
}

export async function deleteProduct(id: string) {
  const product = await Product.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, isPublished: false },
    { new: true }
  );
  if (!product) {
    throw ApiError.notFound("Product not found");
  }
  return product;
}
