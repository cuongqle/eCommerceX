import { Types } from "mongoose";
import { Cart } from "../../models/Cart";
import { Product } from "../../models/Product";
import { ApiError } from "../../utils/ApiError";

async function getOrCreateCart(userId: string) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  await cart.populate({
    path: "items.product",
    select: "name slug price images stock isPublished isDeleted",
  });
  return cart;
}

export async function addItem(userId: string, productId: string, quantity: number) {
  if (!Types.ObjectId.isValid(productId)) {
    throw ApiError.badRequest("Invalid product id");
  }

  const product = await Product.findOne({ _id: productId, isDeleted: false, isPublished: true });
  if (!product) {
    throw ApiError.notFound("Product not found");
  }
  if (product.stock < quantity) {
    throw ApiError.badRequest("Not enough stock");
  }

  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find((item) => item.product.toString() === productId);

  if (existing) {
    const nextQty = existing.quantity + quantity;
    if (product.stock < nextQty) {
      throw ApiError.badRequest("Not enough stock");
    }
    existing.quantity = nextQty;
  } else {
    cart.items.push({ product: new Types.ObjectId(productId), quantity });
  }

  await cart.save();
  return getCart(userId);
}

export async function updateItem(userId: string, productId: string, quantity: number) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((entry) => entry.product.toString() === productId);
  if (!item) {
    throw ApiError.notFound("Item is not in the cart");
  }

  const product = await Product.findById(productId);
  if (!product || product.stock < quantity) {
    throw ApiError.badRequest("Not enough stock");
  }

  item.quantity = quantity;
  await cart.save();
  return getCart(userId);
}

export async function removeItem(userId: string, productId: string) {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();
  return getCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return cart;
}
