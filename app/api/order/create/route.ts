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
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!cart || !user) throw new Error('Missing user or cart');

        // Tạo order trong DB
        const order = await prisma.order.create({
            data: {
                userId,
                shippingAddress: user.address as string,
                paymentMethod: user.paymentMethod as 'Paypal' | 'Stripe' | 'CashOnDelivery',
                itemsPrice: cart.itemsPrice,
                shippingPrice: cart.shippingPrice,
                taxPrice: cart.taxPrice,
                totalPrice: cart.totalPrice,
            },
        });

        return NextResponse.json({ success: true, message: 'Order successfully created', orderId: order.id, redirectTo: `/order/${order.id}` });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message });
    }
}
