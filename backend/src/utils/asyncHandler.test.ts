import { describe, expect, it, vi } from "vitest";
import { asyncHandler } from "./asyncHandler";
import { mockNext, mockRequest, mockResponse } from "../test/http";

describe("asyncHandler", () => {
  it("forwards a rejected promise to next", async () => {
    const error = new Error("boom");
    const handler = asyncHandler(async () => {
      throw error;
    });
    const next = mockNext();

    handler(mockRequest(), mockResponse(), next);
    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });

  it("does not call next when the route resolves", async () => {
    const next = mockNext();
    const handler = asyncHandler(async () => "ok");

    handler(mockRequest(), mockResponse(), next);
    await Promise.resolve();
    expect(next).not.toHaveBeenCalled();
  });
});
