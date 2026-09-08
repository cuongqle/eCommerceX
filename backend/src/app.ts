import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { corsOrigins, env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import adminRoutes from "./routes/admin.routes";
import storeRoutes from "./routes/store.routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", (_req, res) => {
    res.json({
      success: true,
      data: { status: "ok", service: "ecommercex-api" },
    });
  });

  app.use("/api/v1/store", storeRoutes);
  app.use("/api/v1/admin", adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
