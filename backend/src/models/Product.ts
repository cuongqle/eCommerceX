import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: Types.ObjectId;
  sku: string;
  stock: number;
  isPublished: boolean;
  isDeleted: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isPublished: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, isPublished: 1, isDeleted: 1 });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
