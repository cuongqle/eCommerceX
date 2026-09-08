import { describe, expect, it } from "vitest";
import { ApiError } from "./ApiError";

describe("ApiError", () => {
  it("sets name, status, message, and optional details", () => {
    const error = new ApiError(418, "Teapot", { refill: true });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
    expect(error.statusCode).toBe(418);
    expect(error.message).toBe("Teapot");
    expect(error.details).toEqual({ refill: true });
  });

  it.each([
    ["badRequest", 400, "Bad input"],
    ["unauthorized", 401, "Authentication required"],
    ["forbidden", 403, "You do not have permission to perform this action"],
    ["notFound", 404, "Resource not found"],
    ["conflict", 409, "Taken"],
    ["serviceUnavailable", 503, "Down"],
  ] as const)("%s uses HTTP %i", (factory, status, message) => {
    const error =
      factory === "unauthorized" || factory === "forbidden" || factory === "notFound"
        ? ApiError[factory]()
        : ApiError[factory](message);
    expect(error.statusCode).toBe(status);
    expect(error.message).toBe(message);
  });
});
