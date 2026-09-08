import { loadMigrateMongo } from "./migrate-mongo-api";
import { getMigrateMongoConfig } from "./migrate-mongo-config";

export async function runPendingMigrations(): Promise<string[]> {
  const { config, database, up } = await loadMigrateMongo();
  config.set(getMigrateMongoConfig());

  const { db, client } = await database.connect();
  try {
    const migrated = await up(db, client);
    if (migrated.length === 0) {
      console.log("Migrations: up to date");
    } else {
      for (const fileName of migrated) {
        console.log(`Applied migration ${fileName}`);
      }
    }
    return migrated;
  } finally {
    await client.close();
  }
}
