import { Order } from "../../models/Order";
import { Product } from "../../models/Product";
import { User } from "../../models/User";

export async function getDashboardStats() {
  const [totalCustomers, totalProducts, totalOrders, revenueAgg, pipelineAgg, ordersByStatus, lowStock, unpublished, recentOrders] =
    await Promise.all([
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ isDeleted: false }),
      Order.countDocuments(),
      Order.aggregate<{ total: number }>([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate<{ total: number }>([
        { $match: { paymentStatus: "unpaid", status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Product.countDocuments({ isDeleted: false, stock: { $lte: 5 } }),
      Product.countDocuments({ isDeleted: false, isPublished: false }),
      Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(8),
    ]);

  return {
    totals: {
      customers: totalCustomers,
      products: totalProducts,
      orders: totalOrders,
      revenue: revenueAgg[0]?.total ?? 0,
      pipeline: pipelineAgg[0]?.total ?? 0,
      lowStock,
      unpublished,
    },
    ordersByStatus: Object.fromEntries(ordersByStatus.map((row) => [row._id, row.count])),
    recentOrders,
  };
}
