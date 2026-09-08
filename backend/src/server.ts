import { connectDb } from "./config/db";
import { env } from "./config/env";
import { createApp } from "./app";
import { seedIfEmpty } from "./modules/seed/seed.service";

async function bootstrap() {
  await connectDb();
  if (env.SEED_ON_EMPTY) {
    await seedIfEmpty();
  }
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`eCommerceX API running on http://localhost:${env.PORT}`);
    console.log(`Store:   /api/v1/store`);
    console.log(`Admin:   /api/v1/admin`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
