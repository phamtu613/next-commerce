import { prisma } from '@/db/prisma';
import { generateAccessToken, paypal } from '../lib/paypal';
import { approvePayPalOrder } from '@/lib/actions/order.actions';
import { compareSync } from "bcryptjs";

process.env.PAYPAL_CLIENT_ID = 'test-client-id';
process.env.PAYPAL_APP_SECRET = 'test-secret';
process.env.PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com';

describe('PayPal API', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('generates a PayPal access token', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: async () => ({ access_token: 'mock-token' }),
                text: async () => 'mock error text',
            })
        ) as jest.Mock;

        const token = await generateAccessToken();
        expect(token).toBe('mock-token');
    });

    test('creates a PayPal order', async () => {
        // Step 1: Mock token request
        const mockFetch = jest.fn()
            // 1st fetch call → token
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ access_token: 'mock-token' }),
                text: async () => 'mock error',
            })
            // 2nd fetch call → create order
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({ id: 'ORDER123', status: 'CREATED' }),
                text: async () => 'mock error',
            });

        global.fetch = mockFetch as jest.Mock;

        const order = await paypal.createOrder(10.0);

        expect(order).toHaveProperty('id', 'ORDER123');
        expect(order).toHaveProperty('status', 'CREATED');
    });

    test('captures a PayPal order', async () => {
        const mockFetch = jest.fn()
            // 1st fetch call → token
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ access_token: 'mock-token' }),
                text: async () => 'mock error',
            })
            // 2nd fetch call → capture payment
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({ id: 'ORDER123', status: 'COMPLETED' }),
                text: async () => 'mock error',
            });

        global.fetch = mockFetch as jest.Mock;

        const result = await paypal.capturePayment('ORDER123');
        expect(result.status).toBe('COMPLETED');
    });
    jest.mock('@/db/prisma', () => ({
        prisma: {
            order: { findFirst: jest.fn() },
            $transaction: jest.fn((fn) => fn({ order: { update: jest.fn() }, product: { update: jest.fn() } })),
        },
    }));

    jest.mock('@/lib/paypal', () => ({
        paypal: {
            capturePayment: jest.fn(),
        },
    }));

    jest.mock('next/cache', () => ({
        revalidatePath: jest.fn(),
    }));

    jest.mock('@/lib/utils', () => ({
        formatError: (err: any) => err.message || 'Unknown error',
    }));

    // 🧩 Mock toàn bộ module PayPal đúng cách
    jest.mock('../lib/paypal', () => {
        const actual = jest.requireActual('../lib/paypal');
        return {
            ...actual,
            paypal: {
                createOrder: jest.fn(),
                capturePayment: jest.fn(),
            },
            generateAccessToken: jest.fn().mockResolvedValue('mock-token'),
        };
    });

    // 🧩 Mock Prisma client
    jest.mock('@/db/prisma', () => ({
        prisma: {
            order: {
                findFirst: jest.fn(),
            },
            $transaction: jest.fn(async (callback) => callback({
                order: { update: jest.fn() },
                product: { update: jest.fn() },
            })),
        },
    }));

    // tests/paypal.test.ts

    // ---------------------------
    // TOP-LEVEL MOCKS: phải nằm ở đây, TRƯỚC khi import bất kỳ module nào
    // ---------------------------
    jest.mock('@/lib/paypal', () => {
        return {
            // mock hàm generateAccessToken nếu bạn gọi trực tiếp
            generateAccessToken: jest.fn().mockResolvedValue('mock-token'),
            // mock object "paypal" với các phương thức được dùng trong tests / code
            paypal: {
                createOrder: jest.fn(),
                capturePayment: jest.fn(),
            },
        };
    });

    jest.mock('@/db/prisma', () => ({
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

    jest.mock('next/cache', () => ({
        revalidatePath: jest.fn(),
    }));

    jest.mock('@/lib/utils', () => ({
        formatError: (err: any) => err?.message ?? 'Unknown error',
    }));
});

