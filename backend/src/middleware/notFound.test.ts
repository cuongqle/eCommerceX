import { describe, expect, it } from "vitest";
import { mockRequest, mockResponse } from "../test/http";
import { notFound } from "./notFound";

describe("notFound", () => {
  it("responds with 404 JSON", () => {
    const res = mockResponse();
    notFound(mockRequest(), res);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ success: false, message: "Route not found" });
  });
});
