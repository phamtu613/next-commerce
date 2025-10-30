// app/api/order/create/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';

export async function POST(req: Request) {
  console.log("🟢 ===== START /api/order/create =====");

  const session = await auth();
  if (!session) {
    console.log("🚫 Unauthorized request - no session found");
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await req.json();
    console.log("📥 Received body:", { userId });

    if (!userId) throw new Error('Missing required field: userId');

    // ✅ Lấy cart theo userId
    console.log("🛒 Fetching cart for user...");
    const cart = await prisma.cart.findFirst({ where: { userId } });

    if (!cart) {
      console.log("❌ No cart found for user:", userId);
      throw new Error(`Cart not found for user ${userId}`);
    }

    const items = (cart.items as any[]) || [];
    if (items.length === 0) throw new Error("Cart has no items");

    // ✅ Lấy thông tin user
    console.log("👤 Fetching user...");
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`User not found for id: ${userId}`);

    // ✅ Tạo order
    console.log("🧾 Creating order in DB...");
    const order = await prisma.order.create({
      data: {
        userId,
        shippingAddress: user.address ?? 'No address provided',
        paymentMethod: (user.paymentMethod as 'Paypal' | 'Stripe' | 'CashOnDelivery') ?? 'Paypal',
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            qty: item.qty,
            price: item.price,
            name: item.name,
            slug: item.slug,
            image: item.image,
          })),
        },
      },
      include: { orderItems: true },
    });

    console.log("✅ Order created:", order.id);

    return NextResponse.json({
      success: true,
      message: 'Order successfully created',
      orderId: order.id,
      redirectTo: `/order/${order.id}`,
    });

  } catch (err: any) {
    console.error("❌ Order create error:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}
