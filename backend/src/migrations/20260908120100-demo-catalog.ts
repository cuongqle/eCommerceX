import { User } from "../models/User";
import { insertDemoCatalog } from "../modules/seed/seed.service";

export async function up(): Promise<void> {
  const users = await User.countDocuments();
  if (users > 0) {
    return;
  }

  await insertDemoCatalog();
  console.log("Demo catalog ready");
  console.log("Admin:    admin@ecommercex.local / Admin123!");
  console.log("Customer: customer@ecommercex.local / Customer123!");
}

export async function down(): Promise<void> {
  // Demo catalog is not rolled back automatically.
}
