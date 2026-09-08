import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../models/User", () => ({
  User: {
    countDocuments: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock("../../models/Category", () => ({
  Category: { create: vi.fn(), deleteMany: vi.fn() },
}));

vi.mock("../../models/Product", () => ({
  Product: { create: vi.fn(), deleteMany: vi.fn() },
}));

vi.mock("../../models/Order", () => ({
  Order: { deleteMany: vi.fn() },
}));

vi.mock("../../models/Cart", () => ({
  Cart: { deleteMany: vi.fn() },
}));

vi.mock("../settings/settings.service", () => ({
  ensureDefaultSettings: vi.fn(),
}));

import { User } from "../../models/User";
import { Category } from "../../models/Category";
import { Product } from "../../models/Product";
import { seedIfEmpty } from "./seed.service";

describe("seedIfEmpty", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips insert when users already exist", async () => {
    vi.mocked(User.countDocuments).mockResolvedValue(2);
    await expect(seedIfEmpty()).resolves.toEqual({ seeded: false });
    expect(User.create).not.toHaveBeenCalled();
  });

  it("inserts the demo catalog when the database is empty", async () => {
    vi.mocked(User.countDocuments).mockResolvedValue(0);
    vi.mocked(User.create).mockResolvedValue([
      { email: "admin@ecommercex.local" },
      { email: "customer@ecommercex.local" },
    ] as never);
    vi.mocked(Category.create)
      .mockResolvedValueOnce([{ _id: "e" }, { _id: "a" }, { _id: "h" }] as never)
      .mockResolvedValueOnce([
        { _id: "au" },
        { _id: "co" },
        { _id: "sh" },
        { _id: "ou" },
        { _id: "li" },
        { _id: "ta" },
      ] as never);
    vi.mocked(Product.create).mockResolvedValue([] as never);

    await expect(seedIfEmpty()).resolves.toMatchObject({ seeded: true });
    expect(User.create).toHaveBeenCalled();
    expect(Product.create).toHaveBeenCalled();
  });
});
