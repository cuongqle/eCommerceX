import { Cart } from "../../models/Cart";
import { Category } from "../../models/Category";
import { Order } from "../../models/Order";
import { Product } from "../../models/Product";
import { User } from "../../models/User";
import { ensureDefaultSettings } from "../settings/settings.service";

export async function resetCatalog() {
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Cart.deleteMany({}),
  ]);
}

export async function insertDemoCatalog() {
  const [admin, customer] = await User.create([
    {
      name: "Store Admin",
      email: "admin@ecommercex.local",
      password: "Admin123!",
      role: "admin",
    },
    {
      name: "Jane Customer",
      email: "customer@ecommercex.local",
      password: "Customer123!",
      role: "customer",
    },
  ]);

  const [electronics, apparel, home] = await Category.create([
    { name: "Electronics", slug: "electronics", description: "Phones, laptops, and gadgets" },
    { name: "Apparel", slug: "apparel", description: "Everyday clothing" },
    { name: "Home", slug: "home", description: "Home and living" },
  ]);

  const [audio, computing, shirts, outerwear, lighting, tableware] = await Category.create([
    { name: "Audio", slug: "audio", parent: electronics._id },
    { name: "Computing", slug: "computing", parent: electronics._id },
    { name: "Shirts", slug: "shirts", parent: apparel._id },
    { name: "Outerwear", slug: "outerwear", parent: apparel._id },
    { name: "Lighting", slug: "lighting", parent: home._id },
    { name: "Tableware", slug: "tableware", parent: home._id },
  ]);

  await Product.create([
    {
      name: "Wireless Headphones",
      slug: "wireless-headphones",
      description: "Over-ear Bluetooth headphones with 30-hour battery life.",
      price: 129.99,
      compareAtPrice: 159.99,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
      ],
      category: audio._id,
      sku: "EL-HD-001",
      stock: 40,
      isPublished: true,
    },
    {
      name: "Mechanical Keyboard",
      slug: "mechanical-keyboard",
      description: "Compact 75% keyboard with hot-swappable switches.",
      price: 89.0,
      images: [
        "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1587829741301-dc39b554c5d4?auto=format&fit=crop&w=1200&q=80",
      ],
      category: computing._id,
      sku: "EL-KB-002",
      stock: 25,
      isPublished: true,
    },
    {
      name: "Portable Bluetooth Speaker",
      slug: "portable-bluetooth-speaker",
      description: "A compact speaker with a full, room-filling voice.",
      price: 64.0,
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80",
      ],
      category: audio._id,
      sku: "EL-SP-004",
      stock: 30,
      isPublished: true,
    },
    {
      name: "Linen Shirt",
      slug: "linen-shirt",
      description: "Breathable linen shirt for warm weather.",
      price: 48.5,
      images: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
      ],
      category: shirts._id,
      sku: "AP-SH-010",
      stock: 60,
      isPublished: true,
    },
    {
      name: "Wool Overshirt",
      slug: "wool-overshirt",
      description: "A heavyweight overshirt for cooler evenings.",
      price: 118.0,
      images: [
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80",
      ],
      category: outerwear._id,
      sku: "AP-OS-011",
      stock: 22,
      isPublished: true,
    },
    {
      name: "Ceramic Table Lamp",
      slug: "ceramic-table-lamp",
      description: "Warm desk lamp with a ceramic base.",
      price: 72.0,
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
      ],
      category: lighting._id,
      sku: "HM-LP-003",
      stock: 12,
      isPublished: true,
    },
    {
      name: "Stoneware Pourer",
      slug: "stoneware-pourer",
      description: "Handmade stoneware for the table.",
      price: 36.0,
      images: [
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
      ],
      category: tableware._id,
      sku: "HM-PR-008",
      stock: 18,
      isPublished: true,
    },
  ]);

  return { admin, customer };
}

function logDemoAccounts() {
  console.log("Demo catalog ready");
  console.log("Admin:    admin@ecommercex.local / Admin123!");
  console.log("Customer: customer@ecommercex.local / Customer123!");
}

export async function seedFresh() {
  await resetCatalog();
  const created = await insertDemoCatalog();
  await ensureDefaultSettings();
  logDemoAccounts();
  return created;
}

export async function seedIfEmpty() {
  const users = await User.countDocuments();
  if (users > 0) {
    await ensureDefaultSettings();
    return { seeded: false as const };
  }

  const created = await insertDemoCatalog();
  await ensureDefaultSettings();
  logDemoAccounts();
  return { seeded: true as const, ...created };
}
