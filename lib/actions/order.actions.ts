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

export async function createPayPalOrder(orderId: string) {
  console.log('🟢 SERVER: createPayPalOrder called with:', orderId);
  
  try {
    // 1. Tìm order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    console.log('🟢 SERVER: Order found:', order ? 'YES' : 'NO');

    if (!order) {
      console.error('🔴 SERVER: Order not found');
      return {
        success: false,
        message: 'Order not found in database',
        data: null,
      };
    }

    if (order.isPaid) {
      console.error('🔴 SERVER: Order already paid');
      return {
        success: false,
        message: 'Order is already paid',
        data: null,
      };
    }

    // 2. Lấy PayPal access token
    console.log('🟢 SERVER: Getting PayPal access token...');
    const accessToken = await getPayPalAccessToken();
    console.log('🟢 SERVER: Access token obtained');

    // 3. Tạo PayPal order
    console.log('🟢 SERVER: Creating PayPal order...');
    const response = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId,
            amount: {
              currency_code: 'USD',
              value: order.totalPrice.toFixed(2),
            },
          },
        ],
      }),
    });

    const paypalOrder = await response.json();

    console.log('🟢 SERVER: PayPal API response:', {
      status: response.status,
      ok: response.ok,
      orderId: paypalOrder.id,
    });

    if (!response.ok) {
      console.error('🔴 SERVER: PayPal API error:', paypalOrder);
      return {
        success: false,
        message: paypalOrder.message || 'Failed to create PayPal order',
        data: null,
      };
    }

    console.log('✅ SERVER: PayPal order created successfully:', paypalOrder.id);

    // 👇 QUAN TRỌNG: Phải return đúng format
    return {
      success: true,
      message: 'PayPal order created',
      data: paypalOrder.id, // 👈 Đây phải là STRING
    };

  } catch (error) {
    console.error('🔴 SERVER: Exception in createPayPalOrder:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

async function getPayPalAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch(`${process.env.PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${data.error_description || data.error}`);
    }

    return data.access_token;
  } catch (error) {
    console.error('🔴 Error getting PayPal access token:', error);
    throw error;
  }
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
