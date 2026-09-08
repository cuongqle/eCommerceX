import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../utils/ApiError";

vi.mock("../../models/User", () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock("../../utils/token", () => ({
  signToken: vi.fn(() => "signed-token"),
}));

import { User } from "../../models/User";
import { getProfile, login, registerCustomer } from "./auth.service";

const createdUser = { id: "u1", email: "jane@example.com", role: "customer" };

describe("registerCustomer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a duplicate email", async () => {
    vi.mocked(User.findOne).mockResolvedValue({ id: "existing" } as never);
    await expect(
      registerCustomer({ name: "Jane", email: "Jane@example.com", password: "Password1" })
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(User.create).not.toHaveBeenCalled();
  });

  it("creates a customer and returns a token", async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);
    vi.mocked(User.create).mockResolvedValue(createdUser as never);
    await expect(
      registerCustomer({ name: "Jane", email: "Jane@example.com", password: "Password1" })
    ).resolves.toEqual({ user: createdUser, token: "signed-token" });
    expect(User.findOne).toHaveBeenCalledWith({ email: "jane@example.com" });
    expect(User.create).toHaveBeenCalledWith({
      name: "Jane",
      email: "Jane@example.com",
      password: "Password1",
      role: "customer",
    });
  });
});

describe("login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockFoundUser(overrides: Record<string, unknown> = {}) {
    const user = {
      id: "u1",
      email: "jane@example.com",
      role: "customer",
      isActive: true,
      comparePassword: vi.fn().mockResolvedValue(true),
      ...overrides,
    };
    vi.mocked(User.findOne).mockReturnValue({
      select: vi.fn().mockResolvedValue(user),
    } as never);
    return user;
  }

  it("rejects an unknown or inactive account", async () => {
    vi.mocked(User.findOne).mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    } as never);
    await expect(login({ email: "jane@example.com", password: "x" })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("rejects a wrong password", async () => {
    const user = mockFoundUser({ comparePassword: vi.fn().mockResolvedValue(false) });
    await expect(login({ email: "jane@example.com", password: "nope" })).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(user.comparePassword).toHaveBeenCalledWith("nope");
  });

  it("rejects a customer on the admin portal", async () => {
    mockFoundUser({ role: "customer" });
    await expect(
      login({ email: "jane@example.com", password: "Password1", expectedRole: "admin" })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("returns a token for a matching account", async () => {
    const user = mockFoundUser();
    await expect(login({ email: "Jane@example.com", password: "Password1" })).resolves.toEqual({
      user,
      token: "signed-token",
    });
    expect(User.findOne).toHaveBeenCalledWith({ email: "jane@example.com" });
  });
});

describe("getProfile", () => {
  it("throws when the user is missing", async () => {
    vi.mocked(User.findById).mockResolvedValue(null);
    await expect(getProfile("missing")).rejects.toBeInstanceOf(ApiError);
  });

  it("returns the user document", async () => {
    vi.mocked(User.findById).mockResolvedValue(createdUser as never);
    await expect(getProfile("u1")).resolves.toEqual(createdUser);
  });
});
