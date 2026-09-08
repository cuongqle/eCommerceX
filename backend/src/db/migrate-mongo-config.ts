import path from "node:path";
import { env } from "../config/env";

const compiled = !__filename.endsWith(".ts");

export function getMigrateMongoConfig() {
  return {
    mongodb: {
      url: env.MONGODB_URI,
    },
    migrationsDir: path.join(__dirname, "..", "migrations"),
    changelogCollectionName: "changelog",
    lockCollectionName: "changelog_lock",
    lockTtl: 0,
    migrationFileExtension: compiled ? ".js" : ".ts",
    moduleSystem: "commonjs" as const,
  };
}
