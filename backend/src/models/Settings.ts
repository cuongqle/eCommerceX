import mongoose, { type Document, type Model, Schema } from "mongoose";

export const STORE_SETTINGS_KEY = "store";

export interface ISettings extends Document {
  singleton: string;
  name: string;
  tagline: string;
  announcement: string;
  logoUrl: string;
  iconUrl: string;
}

export const DEFAULT_STORE_SETTINGS = {
  singleton: STORE_SETTINGS_KEY,
  name: "eCommerceX",
  tagline: "A considered edit of apparel, electronics, and home.",
  announcement: "Complimentary shipping on every preview order",
  logoUrl: "",
  iconUrl: "",
};

const settingsSchema = new Schema<ISettings>(
  {
    singleton: { type: String, required: true, unique: true, default: STORE_SETTINGS_KEY },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    tagline: { type: String, trim: true, maxlength: 160, default: "" },
    announcement: { type: String, trim: true, maxlength: 160, default: "" },
    logoUrl: { type: String, trim: true, default: "" },
    iconUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

settingsSchema.set("toJSON", {
  transform(_doc, ret) {
    delete (ret as { singleton?: string }).singleton;
    return ret;
  },
});

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", settingsSchema);
