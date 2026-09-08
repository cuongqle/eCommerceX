import { connectDb, disconnectDb } from "../config/db";
import { seedFresh } from "../modules/seed/seed.service";

async function seed() {
  await connectDb();
  await seedFresh();
  await disconnectDb();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectDb();
  process.exit(1);
});
