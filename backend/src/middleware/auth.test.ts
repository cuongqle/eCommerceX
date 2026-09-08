import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNext, mockRequest, mockResponse } from "../test/http";
import { ApiError } from "../utils/ApiError";

vi.mock("../models/User", () => ({
  User: {
    findById: vi.fn(),
  },
}));

vi.mock("../utils/token", () => ({
  verifyToken: vi.fn(),
}));

import { User } from "../models/User";
import { verifyToken } from "../utils/token";
import { authenticate, authorize } from "./auth";

describe("authenticate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a missing bearer token", async () => {
    const next = mockNext();
    await authenticate(mockRequest(), mockResponse(), next);
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  it("rejects an inactive or missing account", async () => {
    vi.mocked(verifyToken).mockReturnValue({ id: "u1", email: "a@b.com", role: "customer" });
    vi.mocked(User.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    } as never);

    const next = mockNext();
    await authenticate(
      mockRequest({ headers: { authorization: "Bearer token" } as never }),
      mockResponse(),
      next
    );
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      message: "Account is inactive or no longer exists",
    });
  });

  it("attaches the user and continues", async () => {
    vi.mocked(verifyToken).mockReturnValue({ id: "u1", email: "a@b.com", role: "customer" });
    vi.mocked(User.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        id: "u1",
        email: "a@b.com",
        role: "customer",
        isActive: true,
      }),
    } as never);

    const req = mockRequest({ headers: { authorization: "Bearer token" } as never });
    const next = mockNext();
    await authenticate(req, mockResponse(), next);
    expect(req.user).toEqual({ id: "u1", email: "a@b.com", role: "customer" });
    expect(next).toHaveBeenCalledWith();
  });

  it("maps verify failures to unauthorized", async () => {
    vi.mocked(verifyToken).mockImplementation(() => {
      throw new Error("jwt expired");
    });
    const next = mockNext();
    await authenticate(
      mockRequest({ headers: { authorization: "Bearer bad" } as never }),
      mockResponse(),
      next
    );
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      message: "Invalid or expired token",
    });
  });
});

describe("authorize", () => {
  it("forbids callers without the required role", () => {
    const req = mockRequest({ user: { id: "u1", email: "a@b.com", role: "customer" } } as never);
    expect(() => authorize("admin")(req, mockResponse(), mockNext())).toThrow(ApiError);
  });

  it("allows a matching role", () => {
    const req = mockRequest({ user: { id: "u1", email: "a@b.com", role: "admin" } } as never);
    const next = mockNext();
    authorize("admin")(req, mockResponse(), next);
    expect(next).toHaveBeenCalledOnce();
  });
});
