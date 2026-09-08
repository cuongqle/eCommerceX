import { connectDb, disconnectDb } from "../config/db";
import { runPendingMigrations } from "../db/migrate";

async function migrate() {
  await connectDb();
  await runPendingMigrations();
  await disconnectDb();
}

migrate().catch(async (error) => {
  console.error(error);
  await disconnectDb();
  process.exit(1);
});
