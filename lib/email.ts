import PurchaseReceiptEmail from "@/email/purchase-receipt";
import { Resend } from "resend";
import type { Order } from "@/types";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendPurchaseReceipt({ order }: { order: Order }) {
  await resend.emails.send({
    from: process.env.SENDER_EMAIL!,
    to: order.user.email!,
    subject: "Your Purchase Receipt",
    react: React.createElement(PurchaseReceiptEmail, { order }),
  });
}
