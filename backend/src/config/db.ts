import mongoose from "mongoose";
import "../models/register";
import { env } from "./env";

export async function connectDb(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
  await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).syncIndexes()));
  console.log("MongoDB connected");
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
