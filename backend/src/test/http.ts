import type { NextFunction, Request, Response } from "express";
import { vi } from "vitest";

export function mockRequest(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  } as Request;
}

export function mockResponse() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(this: { statusCode: number }, code: number) {
      this.statusCode = code;
      return this;
    },
    json(this: { body: unknown }, payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as typeof res & Response;
}

export function mockNext() {
  return vi.fn() as NextFunction & ReturnType<typeof vi.fn>;
}
