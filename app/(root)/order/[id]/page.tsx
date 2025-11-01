import { auth } from "@/auth";
import { getOrderById, updateOrderPaymentStatus } from "@/lib/actions/order.actions"; // ✅ thêm updateOrderPaymentStatus
import { ShippingAddress } from "@/types";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";

export const metadata = {
  title: "Order Details",
};

interface Props {
  params: Promise<{ id: string }>; // ✅ params là Promise
}

const OrderDetailsPage = async ({ params }: Props) => {
  const { id } = await params; // ✅ await params trước khi destructure

  const order = await getOrderById(id);
  if (!order) notFound();

  const session = await auth();

  // Stripe PaymentIntent
  let client_secret: string | null = null;
  if (order.paymentMethod === "Stripe" && !order.isPaid) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/create-payment-intent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(Number(order.totalPrice) * 100),
            orderId: order.id,
          }),
        }
      );

      const data = await res.json();
      client_secret = data.clientSecret;
    } catch (e) {
      console.error("Failed to create PaymentIntent", e);
    }
  }

  const safeOrder = {
    ...order,
    itemsPrice: Number(order.itemsPrice),
    taxPrice: Number(order.taxPrice),
    shippingPrice: Number(order.shippingPrice),
    totalPrice: Number(order.totalPrice),
    shippingAddress: order.shippingAddress as ShippingAddress,
  };

  // ✅ Update order if payment already succeeded
  if (order.paymentMethod === "Stripe" && order.isPaid === false && client_secret === null) {
    try {
      await updateOrderPaymentStatus(order.id, {
        isPaid: true,
        paidAt: new Date().toISOString(),
        paymentMethod: "Stripe",
        paymentResult: {
          id: "stripe_payment_intent_id", // bạn có thể thay bằng giá trị thực khi có PaymentIntent
          status: "succeeded",
          email_address: session?.user?.email || "",
        },
      });
    } catch (e) {
      console.error("Failed to update order payment status", e);
    }
  }

  return (
    <OrderDetailsTable
      order={safeOrder}
      stripeClientSecret={client_secret}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
      isAdmin={session?.user?.role === "admin" || false}
    />
  );
};

export default OrderDetailsPage;
