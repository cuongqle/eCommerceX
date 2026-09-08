import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth.schema";

describe("registerSchema", () => {
  const valid = {
    body: { name: "Jane", email: "jane@example.com", password: "Password1" },
  };

  it("accepts a valid payload", () => {
    expect(registerSchema.parse(valid)).toEqual(valid);
  });

  it("rejects a short name, invalid email, or short password", () => {
    expect(registerSchema.safeParse({ body: { ...valid.body, name: "J" } }).success).toBe(false);
    expect(registerSchema.safeParse({ body: { ...valid.body, email: "jane" } }).success).toBe(false);
    expect(registerSchema.safeParse({ body: { ...valid.body, password: "short" } }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires an email and a password", () => {
    expect(loginSchema.safeParse({ body: { email: "jane@example.com", password: "x" } }).success).toBe(true);
    expect(loginSchema.safeParse({ body: { email: "jane@example.com" } }).success).toBe(false);
  });
});
