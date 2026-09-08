import { describe, expect, it } from "vitest";
import { paginated, parsePagination } from "./pagination";

describe("parsePagination", () => {
  it("defaults to page 1 and limit 12", () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 12, skip: 0 });
  });

  it("computes skip from page and limit", () => {
    expect(parsePagination({ page: 3, limit: 10 })).toEqual({ page: 3, limit: 10, skip: 20 });
  });

  it("clamps page to at least 1", () => {
    expect(parsePagination({ page: 0 }).page).toBe(1);
    expect(parsePagination({ page: -4 }).page).toBe(1);
  });

  it("clamps limit between 1 and 50", () => {
    expect(parsePagination({ limit: 0 }).limit).toBe(12);
    expect(parsePagination({ limit: 200 }).limit).toBe(50);
  });

  it("treats non-numeric values as defaults", () => {
    expect(parsePagination({ page: "abc", limit: "nope" })).toEqual({ page: 1, limit: 12, skip: 0 });
  });
});

describe("paginated", () => {
  it("wraps items with page metadata", () => {
    expect(paginated(["a", "b"], 25, 2, 10)).toEqual({
      items: ["a", "b"],
      pagination: { total: 25, page: 2, limit: 10, pages: 3 },
    });
  });

  it("returns at least one page when the collection is empty", () => {
    expect(paginated([], 0, 1, 12).pagination.pages).toBe(1);
  });
});
