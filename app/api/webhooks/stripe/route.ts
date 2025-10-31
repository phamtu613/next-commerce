import { updateOrderPaymentStatus } from "@/lib/actions/order.actions";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    await updateOrderPaymentStatus(paymentIntent.metadata.orderId, {
      isPaid: true,
      paidAt: new Date().toISOString(),
      paymentMethod: "Stripe",
      paymentResult: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        email_address: paymentIntent.receipt_email ?? undefined,
      },
    });
  }

  return NextResponse.json({ received: true });
}
