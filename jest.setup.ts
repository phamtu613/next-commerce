// jest.setup.ts

// 🧩 Mock next-auth ESM
jest.mock('next-auth', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      handlers: {},
      signIn: jest.fn(),
      signOut: jest.fn(),
      auth: jest.fn(),
    })), // 👈 mock là 1 function trả về object
  };
});

jest.mock('next-auth/providers/credentials', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({})), // 👈 mock function để tránh lỗi "is not a function"
  };
});


// 🧩 Mock next/server (vì NextAuth import NextResponse)
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

// 🧩 Nếu có prisma import, đảm bảo Jest không chạm DB thật
jest.mock('@/db/prisma', () => ({
  prisma: {
    order: { findFirst: jest.fn(), update: jest.fn() },
    product: { update: jest.fn() },
    $transaction: jest.fn((fn) => fn({ order: { update: jest.fn() }, product: { update: jest.fn() } })),
  },
}));
