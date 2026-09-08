import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "./token";

const payload = { id: "user-1", email: "jane@example.com", role: "customer" as const };

describe("token", () => {
  it("round-trips a signed payload", () => {
    const token = signToken(payload);
    expect(verifyToken(token)).toMatchObject(payload);
  });

  it("rejects a tampered token", () => {
    const token = signToken(payload);
    expect(() => verifyToken(`${token}x`)).toThrow();
  });
});
