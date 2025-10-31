import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    const { cartId, userId } = await req.json();

    const cart = await prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart)
      return NextResponse.json({ success: false, message: "Cart not found" });

    const order = await prisma.order.create({
      data: {
        userId,
        paymentMethod: "PayPal",
        shippingAddress: {},
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
