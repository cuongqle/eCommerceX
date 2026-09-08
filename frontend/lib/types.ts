export type UserRole = "customer" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | Category | null;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: Category | string;
  sku: string;
  stock: number;
  isPublished: boolean;
  isDeleted: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface OrderItemProduct {
  _id: string;
  name: string;
  slug: string;
  images: string[];
}

export interface OrderItem {
  product: string | OrderItemProduct;
  name: string;
  slug?: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
}

export interface DashboardStats {
  totals: {
    customers: number;
    products: number;
    orders: number;
    revenue: number;
    pipeline?: number;
    lowStock?: number;
    unpublished?: number;
  };
  ordersByStatus: Record<string, number>;
  recentOrders: Order[];
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface StoreSettings {
  name: string;
  tagline: string;
  announcement: string;
  logoUrl: string;
  iconUrl: string;
}

export function categoryName(category: Product["category"]): string {
  return typeof category === "string" ? category : category.name;
}

export function categoryTrail(category: Product["category"]): { name: string; slug: string }[] {
  if (typeof category === "string") return [];
  const trail: { name: string; slug: string }[] = [];
  if (category.parent && typeof category.parent === "object") {
    trail.push({ name: category.parent.name, slug: category.parent.slug });
  }
  trail.push({ name: category.name, slug: category.slug });
  return trail;
}

export function customerName(user: Order["user"]): string {
  return typeof user === "string" ? user : user.name;
}
