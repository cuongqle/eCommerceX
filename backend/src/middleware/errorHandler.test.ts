import mongoose from "mongoose";
import { describe, expect, it, vi } from "vitest";
import { mockNext, mockRequest, mockResponse } from "../test/http";
import { ApiError } from "../utils/ApiError";
import { errorHandler } from "./errorHandler";

describe("errorHandler", () => {
  it("serializes an ApiError", () => {
    const res = mockResponse();
    errorHandler(ApiError.badRequest("Nope", { field: "sku" }), mockRequest(), res, mockNext());
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ success: false, message: "Nope", details: { field: "sku" } });
  });

  it("maps a CastError to 400", () => {
    const res = mockResponse();
    errorHandler(new mongoose.Error.CastError("ObjectId", "nope", "_id"), mockRequest(), res, mockNext());
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ success: false, message: "Invalid id" });
  });

  it("maps a ValidationError to 400", () => {
    const res = mockResponse();
    const err = new mongoose.Error.ValidationError();
    errorHandler(err, mockRequest(), res, mockNext());
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: "Validation failed" });
  });

  it("maps a duplicate key error to 409", () => {
    const res = mockResponse();
    errorHandler({ code: 11000, keyValue: { email: "a@b.com" } }, mockRequest(), res, mockNext());
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      success: false,
      message: "Duplicate value",
      details: { email: "a@b.com" },
    });
  });

  it("hides unexpected errors as 500", () => {
    const res = mockResponse();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    errorHandler(new Error("secret"), mockRequest(), res, mockNext());
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ success: false, message: "secret" });
  });
});
