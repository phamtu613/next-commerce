import { updateOrderToPaid } from "@/lib/actions/order.actions";
import { PaymentResult, ShippingAddress } from "@/types";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id: orderId } = params;
  const paymentResult = await req.json();

  // Cập nhật order
  const updatedOrder = await updateOrderToPaid({ orderId, paymentResult });

  // Gửi email thông báo
  await sendPurchaseReceipt({
    order: {
      ...updatedOrder,
      shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
      paymentResult: updatedOrder.paymentResult as PaymentResult,
    },
  });

  return new Response(JSON.stringify({ success: true, order: updatedOrder }));
}
