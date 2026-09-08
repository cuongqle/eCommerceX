import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  set: vi.fn(),
  close: vi.fn(),
  connect: vi.fn(),
  up: vi.fn(),
}));

vi.mock("./migrate-mongo-api", () => ({
  loadMigrateMongo: () =>
    Promise.resolve({
      config: { set: mocks.set },
      database: { connect: mocks.connect },
      up: mocks.up,
    }),
}));

import { runPendingMigrations } from "./migrate";

describe("runPendingMigrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connect.mockResolvedValue({ db: {}, client: { close: mocks.close } });
  });

  it("applies pending migrate-mongo files", async () => {
    mocks.up.mockResolvedValue(["20260908120000-store-settings.js"]);
    await expect(runPendingMigrations()).resolves.toEqual(["20260908120000-store-settings.js"]);
    expect(mocks.set).toHaveBeenCalledOnce();
    expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ lockTtl: 0 }));
    expect(mocks.up).toHaveBeenCalledOnce();
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  it("closes the client when up to date", async () => {
    mocks.up.mockResolvedValue([]);
    await expect(runPendingMigrations()).resolves.toEqual([]);
    expect(mocks.close).toHaveBeenCalledOnce();
  });
});
