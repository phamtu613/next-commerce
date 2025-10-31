"use client";

import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  approvePayPalOrder,
  createPayPalOrder,
} from "@/lib/actions/order.actions";
import type { Order } from "@/types";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import StripePayment from "./stripe-payment";
const OrderDetailsTable = ({
  order,
  paypalClientId,
  stripeClientSecret,
}: {
  order: Order;
  paypalClientId: string;
  stripeClientSecret?: string | null;
}) => {
  const { isPaid, paymentMethod } = order;

  function PrintLoadingState() {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    if (isPending) return <p>Loading PayPal...</p>;
    if (isRejected) return <p>Error in loading PayPal.</p>;
    return null;
  }

  const handleCreatePayPalOrder = async () => {
    try {
      console.log("🔵 Creating PayPal order...");
      console.log("🔵 Order ID:", order.id);
      console.log("🔵 Total Price:", order.totalPrice);

      const paypalOrderId = await createPayPalOrder(order.id, order.totalPrice);

      console.log("✅ PayPal order created:", paypalOrderId);

      if (!paypalOrderId || typeof paypalOrderId !== "string") {
        throw new Error("Invalid PayPal order ID received");
      }

      return paypalOrderId;
    } catch (error) {
      console.error("❌ Error creating PayPal order:", error);
      toast({
        description:
          error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    try {
      console.log("🟡 Approving PayPal order:", data.orderID);

      const res = await approvePayPalOrder(order.id, data);

      console.log("🟡 Approval response:", res);

      toast({
        description:
          res.message ||
          (res.success ? "Payment successful!" : "Payment failed"),
        variant: res.success ? "default" : "destructive",
      });

      if (!res.success) {
        throw new Error(res.message);
      }

      if (res.success) {
        setTimeout(() => {
          window.location.href = `/order/${order.id}`;
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Error in handleApprovePayPalOrder:", error);
      toast({
        description:
          error instanceof Error ? error.message : "Payment approval failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 space-y-2">
          <h2 className="text-xl font-bold">Order Details</h2>
          <p>
            Order ID: <span className="font-mono">{order.id}</span>
          </p>
          <p>Payment Method: {paymentMethod}</p>
          <p>Status: {isPaid ? "✅ Paid" : "⏳ Unpaid"}</p>
          <p>Total: ${order.totalPrice}</p>
        </div>

        {/* PayPal Payment */}
        {!isPaid && paymentMethod === "PayPal" && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Complete Payment</h3>
            <PayPalScriptProvider
              options={{
                clientId: paypalClientId,
                currency: "USD",
                intent: "capture",
              }}
            >
              <PrintLoadingState />
              <PayPalButtons
                style={{
                  layout: "vertical",
                  color: "gold",
                  shape: "rect",
                  label: "paypal",
                }}
                createOrder={handleCreatePayPalOrder}
                onApprove={handleApprovePayPalOrder}
                onError={(err) => {
                  console.error("💥 PayPal Button Error:", err);
                  toast({
                    description: "An error occurred with PayPal",
                    variant: "destructive",
                  });
                }}
                onCancel={() => {
                  console.log("⚠️ Payment cancelled by user");
                  toast({
                    description: "Payment was cancelled",
                  });
                }}
              />
            </PayPalScriptProvider>
          </div>
        )}

        {/* Stripe Payment */}
        {!isPaid && paymentMethod === "Stripe" && stripeClientSecret && (
          <div className="border rounded-lg p-4 mt-4">
            <h3 className="font-semibold mb-3">Complete Stripe Payment</h3>
            <StripePayment
              priceInCents={Number(order.totalPrice) * 100}
              orderId={order.id}
              clientSecret={stripeClientSecret}
            />
          </div>
        )}

        {/* Paid Message */}
        {isPaid && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">
              ✅ This order has been paid
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderDetailsTable;
