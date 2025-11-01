// lib/paypal.ts
import { prisma } from "@/db/prisma";

const base = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

async function handleResponse(response: any) {
    if (response.status === 200 || response.status === 201) {
        return response.json();
    }
    const errorMessage = await response.text();
    throw new Error(`PayPal API Error: ${errorMessage}`);
}

export async function generateAccessToken() {
    const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
    if (!PAYPAL_CLIENT_ID || !PAYPAL_APP_SECRET) {
        throw new Error('Missing PayPal credentials in environment variables');
    }
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString('base64');
    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    const jsonData = await handleResponse(response);
    return jsonData.access_token;
}

export const paypal = {
    createOrderFromDb: async function createOrderFromDb(orderId: string) {
        // 1️⃣ Lấy order + orderItems
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true },
        });

        if (!order) throw new Error("Order not found");

        // 2️⃣ Helper to ensure 2 decimal precision
        const toDecimal = (val: any): number => {
            return Math.round(Number(val) * 100) / 100;
        };

        // 3️⃣ Build items array with proper decimal precision
        const paypalItems = order.orderItems.map(item => {
            const unitPrice = toDecimal(item.price);
            return {
                name: item.name,
                unit_amount: { 
                    currency_code: 'USD', 
                    value: unitPrice.toFixed(2)
                },
                quantity: String(item.qty),
                category: 'PHYSICAL_GOODS' as const,
                sku: item.slug,
                image_url: item.image,
            };
        });

        // 4️⃣ Calculate itemTotal by summing the EXACT values that PayPal will receive
        let calculatedItemTotal = 0;
        paypalItems.forEach(item => {
            const price = Number(item.unit_amount.value);
            const qty = Number(item.quantity);
            calculatedItemTotal += toDecimal(price * qty);
        });

        const itemTotal = calculatedItemTotal.toFixed(2);
        const shipping = toDecimal(order.shippingPrice || 0).toFixed(2);
        const tax = toDecimal(order.taxPrice || 0).toFixed(2);
        
        // Calculate total from the fixed decimal strings
        const total = (
            Number(itemTotal) + 
            Number(shipping) + 
            Number(tax)
        ).toFixed(2);

        // 5️⃣ Build request body
        const body = {
            intent: 'CAPTURE',
            payment_source: {
                paypal: {
                    experience_context: {
                        payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                        landing_page: 'LOGIN',
                        shipping_preference: 'GET_FROM_FILE',
                        user_action: 'PAY_NOW',
                        return_url: 'http://localhost:3000/paypal/success',
                        cancel_url: 'http://localhost:3000/paypal/cancel',
                    }
                }
            },
            purchase_units: [
                {
                    reference_id: order.id,
                    amount: {
                        currency_code: 'USD',
                        value: total,
                        breakdown: {
                            item_total: { currency_code: 'USD', value: itemTotal },
                            shipping: { currency_code: 'USD', value: shipping },
                            tax_total: { currency_code: 'USD', value: tax },
                        },
                    },
                    items: paypalItems,
                },
            ],
        };

        // Debug logging - check your SERVER console for this
        console.log("📊 PayPal Calculation Verification:");
        console.log(`Items count: ${paypalItems.length}`);
        paypalItems.forEach((item, i) => {
            const subtotal = toDecimal(Number(item.unit_amount.value) * Number(item.quantity));
            console.log(`  [${i}] ${item.name}: $${item.unit_amount.value} × ${item.quantity} = $${subtotal.toFixed(2)}`);
        });
        console.log(`Calculated Item Total: $${itemTotal}`);
        console.log(`Shipping: $${shipping}`);
        console.log(`Tax: $${tax}`);
        console.log(`Grand Total: $${total}`);
        console.log("📦 Full PayPal body:", JSON.stringify(body, null, 2));

        // 6️⃣ Gọi API PayPal
        const accessToken = await generateAccessToken();
        const url = `${base}/v2/checkout/orders`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        });

        const result = await handleResponse(response);
        console.log("✅ PayPal order created:", result);

        return result;
    },

    capturePayment: async function capturePayment(orderId: string) {
        const accessToken = await generateAccessToken();
        const url = `${base}/v2/checkout/orders/${orderId}/capture`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return handleResponse(response);
    },
};
