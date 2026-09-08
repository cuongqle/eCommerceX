import { Cart } from "../../models/Cart";
import { Order, type OrderStatus, type PaymentStatus } from "../../models/Order";
import { Product } from "../../models/Product";
import { ApiError } from "../../utils/ApiError";
import { paginated, parsePagination } from "../../utils/pagination";

interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export async function createOrder(userId: string, shippingAddress: ShippingAddress, shippingFee = 0) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest("Cart is empty");
  }

  const reserved: { productId: string; quantity: number }[] = [];
  const orderItems = [];
  let subtotal = 0;

  try {
    for (const item of cart.items) {
      const productId = item.product.toString();
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          isDeleted: false,
          isPublished: true,
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!product) {
        throw ApiError.badRequest("A product is unavailable or does not have enough stock");
      }

      reserved.push({ productId, quantity: item.quantity });
      orderItems.push({
        product: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images[0],
        price: product.price,
        quantity: item.quantity,
      });
      subtotal += product.price * item.quantity;
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      status: "pending",
      paymentStatus: "unpaid",
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
    });

    cart.items = [];
    await cart.save();
    return order;
  } catch (error) {
    await Promise.all(
      reserved.map(({ productId, quantity }) => Product.updateOne({ _id: productId }, { $inc: { stock: quantity } }))
    );
    throw error;
  }
}

function productIdOf(product: unknown): string {
  if (product && typeof product === "object" && "_id" in product) {
    return String((product as { _id: unknown })._id);
  }
  return String(product);
}

async function hydrateOrderItems<T extends { items: { product: unknown; name: string; slug?: string; image?: string; price: number; quantity: number }[] }>(
  order: T
): Promise<T> {
  const ids = [...new Set(order.items.map((item) => productIdOf(item.product)))];
  const products = await Product.find({ _id: { $in: ids } }).select("name slug images");
  const byId = new Map(products.map((product) => [product._id.toString(), product]));

  order.items = order.items.map((item) => {
    const product = byId.get(productIdOf(item.product));
    return {
      ...item,
      slug: item.slug ?? product?.slug,
      image: item.image ?? product?.images[0],
      product: product
        ? { _id: product._id, name: product.name, slug: product.slug, images: product.images }
        : item.product,
    };
  }) as T["items"];

  return order;
}

export async function listMyOrders(userId: string, query: { page?: unknown; limit?: unknown }) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { user: userId };
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  const hydrated = await Promise.all(items.map((order) => hydrateOrderItems(order)));
  return paginated(hydrated, total, page, limit);
}

export async function getMyOrder(userId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, user: userId }).lean();
  if (!order) {
    throw ApiError.notFound("Order not found");
  }
  return hydrateOrderItems(order);
}

export async function listAdminOrders(query: { page?: unknown; limit?: unknown; status?: unknown }) {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = {};
  if (typeof query.status === "string" && query.status) {
    filter.status = query.status;
  }

  const [items, total] = await Promise.all([
    Order.find(filter).populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  return paginated(items, total, page, limit);
}

export async function getAdminOrder(orderId: string) {
  const order = await Order.findById(orderId).populate("user", "name email");
  if (!order) {
    throw ApiError.notFound("Order not found");
  }
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  input: { status?: OrderStatus; paymentStatus?: PaymentStatus }
) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  if (input.status) order.status = input.status;
  if (input.paymentStatus) order.paymentStatus = input.paymentStatus;
  await order.save();
  return order;
}
