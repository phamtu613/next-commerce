// app/api/paypal/order/create/route.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { orderId } = await req.json();

    if (!orderId) return NextResponse.json({ success: false, message: 'Missing orderId' });

    // Gọi PayPal API tạo order
    const accessTokenRes = await fetch(`${process.env.PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const { access_token } = await accessTokenRes.json();

    const paypalOrderRes = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId,
            amount: {
              currency_code: 'USD',
              value: '100.00', // thay bằng totalPrice order của bạn
            },
          },
        ],
      }),
    });

    const paypalOrderData = await paypalOrderRes.json();

    if (!paypalOrderData.id) return NextResponse.json({ success: false, data: null, message: 'PayPal order creation failed' });

    return NextResponse.json({ success: true, data: paypalOrderData.id });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, message: err.message });
  }
}
