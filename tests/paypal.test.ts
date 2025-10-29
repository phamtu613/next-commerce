import { generateAccessToken, paypal } from "../lib/paypal";

process.env.PAYPAL_CLIENT_ID = "test-client-id";
process.env.PAYPAL_APP_SECRET = "test-secret";
process.env.PAYPAL_API_URL = "https://api-m.sandbox.paypal.com";

describe("PayPal API", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("generates a PayPal access token", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ access_token: "mock-token" }),
        text: async () => "mock error text",
      })
    ) as jest.Mock;

    const token = await generateAccessToken();
    expect(token).toBe("mock-token");
  });

  test("creates a PayPal order", async () => {
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: "mock-token" }),
        text: async () => "mock error",
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "ORDER123", status: "CREATED" }),
        text: async () => "mock error",
      });

    global.fetch = mockFetch as jest.Mock;

    const order = await paypal.createOrder(10.0);

    expect(order).toHaveProperty("id", "ORDER123");
    expect(order).toHaveProperty("status", "CREATED");
  });

  test("captures a PayPal order", async () => {
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: "mock-token" }),
        text: async () => "mock error",
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "ORDER123", status: "COMPLETED" }),
        text: async () => "mock error",
      });

    global.fetch = mockFetch as jest.Mock;

    const result = await paypal.capturePayment("ORDER123");
    expect(result.status).toBe("COMPLETED");
  });
  jest.mock("@/db/prisma", () => ({
    prisma: {
      order: { findFirst: jest.fn() },
      $transaction: jest.fn((fn) =>
        fn({ order: { update: jest.fn() }, product: { update: jest.fn() } })
      ),
    },
  }));

  jest.mock("@/lib/paypal", () => ({
    paypal: {
      capturePayment: jest.fn(),
    },
  }));

  jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
  }));

  jest.mock("@/lib/utils", () => ({
    formatError: (err: any) => err.message || "Unknown error",
  }));

  jest.mock("../lib/paypal", () => {
    const actual = jest.requireActual("../lib/paypal");
    return {
      ...actual,
      paypal: {
        createOrder: jest.fn(),
        capturePayment: jest.fn(),
      },
      generateAccessToken: jest.fn().mockResolvedValue("mock-token"),
    };
  });

  jest.mock("@/db/prisma", () => ({
    prisma: {
      order: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(async (callback) =>
        callback({
          order: { update: jest.fn() },
          product: { update: jest.fn() },
        })
      ),
    },
  }));

  jest.mock("@/lib/paypal", () => {
    return {
      generateAccessToken: jest.fn().mockResolvedValue("mock-token"),
      paypal: {
        createOrder: jest.fn(),
        capturePayment: jest.fn(),
      },
    };
  });

  jest.mock("@/db/prisma", () => ({
    prisma: {
      order: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(async (cb: any) =>
        cb({
          order: { update: jest.fn() },
          product: { update: jest.fn() },
        })
      ),
    },
  }));

  jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
  }));

  jest.mock("@/lib/utils", () => ({
    formatError: (err: any) => err?.message ?? "Unknown error",
  }));
});
