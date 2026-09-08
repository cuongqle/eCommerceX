import { describe, expect, it } from "vitest";
import { z } from "zod";
import { mockNext, mockRequest, mockResponse } from "../test/http";
import { ApiError } from "../utils/ApiError";
import { validate } from "./validate";

const schema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

describe("validate", () => {
  it("writes parsed body onto the request", () => {
    const req = mockRequest({ body: { email: "jane@example.com" } });
    const next = mockNext();
    validate(schema)(req, mockResponse(), next);
    expect(req.body).toEqual({ email: "jane@example.com" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("throws a 400 ApiError when the body is invalid", () => {
    const req = mockRequest({ body: { email: "not-an-email" } });
    expect(() => validate(schema)(req, mockResponse(), mockNext())).toThrow(ApiError);
    try {
      validate(schema)(req, mockResponse(), mockNext());
    } catch (error) {
      expect(error).toMatchObject({ statusCode: 400, message: "Validation failed" });
    }
  });
});
