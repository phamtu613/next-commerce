// app/api/order/create/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { cartId, userId } = await req.json();

    // Lấy cart từ DB
    const cart = await prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) return NextResponse.json({ success: false, message: 'Cart not found' });

    // Tạo order trong DB
    const order = await prisma.order.create({
      data: {
        userId,
        paymentMethod: 'PayPal', // hoặc lấy từ user
        shippingAddress: {}, // nếu có
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message });
  }
}
