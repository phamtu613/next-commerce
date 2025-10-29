jest.mock("next-auth", () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      handlers: {},
      signIn: jest.fn(),
      signOut: jest.fn(),
      auth: jest.fn(),
    })),
  };
});

jest.mock("next-auth/providers/credentials", () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({})),
  };
});

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

jest.mock("@/db/prisma", () => ({
  prisma: {
    order: { findFirst: jest.fn(), update: jest.fn() },
    product: { update: jest.fn() },
    $transaction: jest.fn((fn) =>
      fn({ order: { update: jest.fn() }, product: { update: jest.fn() } })
    ),
  },
}));
