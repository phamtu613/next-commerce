// lib/paypal.ts

const base = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

// ───────────────────────────────
// Common Response Handler
// ───────────────────────────────
async function handleResponse(response: any) {
    if (response.status === 200 || response.status === 201) {
        return response.json();
    }

    const errorMessage = await response.text();
    throw new Error(`PayPal API Error: ${errorMessage}`);
}

// ───────────────────────────────
// Generate Access Token
// ───────────────────────────────
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

// ───────────────────────────────
// PayPal Object (create & capture)
// ───────────────────────────────
export const paypal = {
    // Create Order
    createOrder: async function createOrder(price: number) {
        const accessToken = await generateAccessToken();
        const url = `${base}/v2/checkout/orders`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'USD',
                            value: price.toFixed(2), // ✅ convert number → string "10.00"
                        },
                    },
                ],
            })

        });

        return handleResponse(response);
    },

    // Capture Payment
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
