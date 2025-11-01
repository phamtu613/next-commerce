import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover", // hoặc version bạn dùng
});

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId } = await req.json();

    if (!amount || !orderId) {
      return NextResponse.json({ error: "Missing amount or orderId" }, { status: 400 });
    }

    // Tạo Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // cents
      currency: "USD",
      metadata: { orderId },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    console.error("Stripe PaymentIntent error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
