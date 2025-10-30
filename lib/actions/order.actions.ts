'use server';

import { convertToPlainObject, formatError } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.actions';
import { redirect } from 'next/navigation';
import { prisma } from '@/db/prisma';
import { CartItem, PaymentResult } from '@/types';
import { insertOrderSchema } from '../validator';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { paypal } from '../paypal';
import { revalidatePath } from 'next/cache';
import { Decimal } from '@prisma/client/runtime/library';

// Create an order
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error('User is not authenticated');

    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error('User not found');

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return { success: false, message: 'Your cart is empty', redirectTo: '/cart' };
    }
    if (!user.address) {
      return { success: false, message: 'Please add a shipping address', redirectTo: '/shipping-address' };
    }
    if (!user.paymentMethod) {
      return { success: false, message: 'Please select a payment method', redirectTo: '/payment-method' };
    }

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const insertedOrder = await tx.order.create({ data: order });
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error('Order not created');

    return { success: true, message: 'Order successfully created', redirectTo: `/order/${insertedOrderId}` };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });
  return convertToPlainObject(data);
}

export async function createPayPalOrder(
  orderId: string,
  totalPrice: number | string
): Promise<string> {
  console.log("🟢 ===== START createPayPalOrder =====");
  console.log("🟢 orderId:", orderId);
  console.log("🟢 totalPrice RAW:", totalPrice);

  if (!orderId) throw new Error("Missing orderId for PayPal order");

  const total = typeof totalPrice === "string" ? parseFloat(totalPrice) : totalPrice;

  if (isNaN(total) || total <= 0) {
    throw new Error(`Invalid totalPrice: ${totalPrice}`);
  }

  const accessToken = await getPayPalAccessToken();

  // 🧩 JSON body theo chuẩn PayPal API (y hệt curl bạn gửi)
  const body = {
    intent: "CAPTURE",
    payment_source: {
      paypal: {
        experience_context: {
          payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
          landing_page: "LOGIN",
          shipping_preference: "GET_FROM_FILE",
          user_action: "PAY_NOW",
          return_url: "https://example.com/returnUrl",
          cancel_url: "https://example.com/cancelUrl",
        },
      },
    },
    purchase_units: [
      {
        invoice_id: orderId,
        amount: {
          currency_code: "USD",
          value: total.toFixed(2),
          breakdown: {
            item_total: { currency_code: "USD", value: (total - 10).toFixed(2) },
            shipping: { currency_code: "USD", value: "10.00" },
          },
        },
        items: [
          {
            name: "T-Shirt",
            description: "Super Fresh Shirt",
            unit_amount: { currency_code: "USD", value: "20.00" },
            quantity: "1",
            category: "PHYSICAL_GOODS",
            sku: "sku01",
            image_url: "https://example.com/static/images/items/1/tshirt_green.jpg",
            url: "https://example.com/url-to-the-item-being-purchased-1",
            upc: { type: "UPC-A", code: "123456789012" },
          },
          {
            name: "Shoes",
            description: "Running, Size 10.5",
            sku: "sku02",
            unit_amount: { currency_code: "USD", value: "100.00" },
            quantity: "2",
            category: "PHYSICAL_GOODS",
            image_url: "https://example.com/static/images/items/1/shoes_running.jpg",
            url: "https://example.com/url-to-the-item-being-purchased-2",
            upc: { type: "UPC-A", code: "987654321012" },
          },
        ],
      },
    ],
  };

  console.log("📦 PayPal request body:", JSON.stringify(body, null, 2));

  const res = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "PayPal-Request-Id": crypto.randomUUID(), // giúp tránh trùng request
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log("📩 PayPal API response:", data);

  if (!res.ok || !data.id) {
    console.error("❌ PayPal API error:", data);
    throw new Error(data.message || "Failed to create PayPal order");
  }

  console.log("✅ PayPal order created successfully:", data.id);
  console.log("🟢 ===== END createPayPalOrder =====");
  return data.id;
}



export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_APP_SECRET;


  if (!clientId || !secret) throw new Error('PayPal credentials are missing');

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

  const res = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('PayPal token error:', data);
    throw new Error(`Failed to get access token: ${data.error_description || data.error}`);
  }

  return data.access_token;
}
// ✅ Approve Paypal Order
export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    // 1️⃣ Tìm đơn hàng trong database
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });
    if (!order) throw new Error('Order not found');

    // 2️⃣ Capture thanh toán từ PayPal
    const captureData = await paypal.capturePayment(data.orderID);
    if (!captureData || captureData.status !== 'COMPLETED') {
      throw new Error('Error in PayPal payment');
    }

    // 3️⃣ Cập nhật đơn hàng thành "đã thanh toán"
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer?.email_address,
        pricePaid:
          captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value,
      },
    });

    // 4️⃣ Revalidate cache trang order detail
    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Your order has been successfully paid by PayPal',
    };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// ✅ Update Order to Paid
async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  // 1️⃣ Tìm đơn hàng
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: { orderItems: true },
  });

  if (!order) throw new Error('Order not found');
  if (order.isPaid) throw new Error('Order is already paid');

  // 2️⃣ Transaction cập nhật đơn hàng + tồn kho
  await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  // 3️⃣ Lấy lại order sau update
  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!updatedOrder) throw new Error('Order not found');
  return updatedOrder;
}
