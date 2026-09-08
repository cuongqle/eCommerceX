import { z } from "zod";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "../../models/Order";

const shippingAddress = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(3),
  country: z.string().min(2),
});

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress,
    shippingFee: z.number().nonnegative().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  }),
});
