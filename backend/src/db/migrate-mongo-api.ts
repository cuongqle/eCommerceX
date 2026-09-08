export interface MigrateMongo {
  config: { set: (config: unknown) => void };
  database: {
    connect: () => Promise<{ db: object; client: { close: () => Promise<void> } }>;
  };
  up: (db: object, client: object) => Promise<string[]>;
}

type MigrateMongoModule = Partial<MigrateMongo> & { default?: Partial<MigrateMongo> };

export async function loadMigrateMongo(): Promise<MigrateMongo> {
  // v14 is ESM. tsc+CJS would rewrite `import()` to `require()`, which returns a Promise proxy
  // without `.set`. Native import keeps the real named exports in Docker.
  const nativeImport = new Function("specifier", "return import(specifier)") as (
    specifier: string
  ) => Promise<MigrateMongoModule>;
  const mod = await nativeImport("migrate-mongo");
  const config = mod.config ?? mod.default?.config;
  const database = mod.database ?? mod.default?.database;
  const up = mod.up ?? mod.default?.up;

  if (!config || !database || !up) {
    throw new Error("migrate-mongo API is unavailable");
  }

  return { config, database, up };
}
