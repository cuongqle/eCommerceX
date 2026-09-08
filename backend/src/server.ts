import { connectDb } from "./config/db";
import { env } from "./config/env";
import { createApp } from "./app";

async function bootstrap() {
  await connectDb();
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
