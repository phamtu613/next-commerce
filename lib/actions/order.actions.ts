"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult } from "@/types";
import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { PAGE_SIZE } from "../constants";
import { ROUTES } from "../constants/routes";
import { paypal } from "../paypal";
import { convertToPlainObject, formatError } from "../utils";
import { insertOrderSchema } from "../validator";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error("User not found");

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: "Please add a shipping address",
        redirectTo: "/shipping-address",
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: "Please select a payment method",
        redirectTo: "/payment-method",
      };
    }

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const insertedOrder = await tx.order.create({ data: order });
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error("Order not created");

    return {
      success: true,
      message: "Order successfully created",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });
  return convertToPlainObject(data);
}

export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();
  if (!session) throw new Error("User is not authenticated");

  const data = await prisma.order.findMany({
    where: { userId: session.user.id! },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where: { userId: session.user.id! },
  });

  return {
    data: convertToPlainObject(data),
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function getOrderSummary() {
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });

  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData: SalesDataType = salesDataRaw.map((entry) => ({
    month: entry.month,
    totalSales: Number(entry.totalSales),
  }));

  const latestOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    latestOrders: convertToPlainObject(latestOrders),
    salesData,
  };
}

export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query?: string;
}) {
  const queryFilter: Prisma.OrderWhereInput =
    query && query !== "all"
      ? {
          user: {
            name: {
              contains: query,
              mode: "insensitive",
            } as Prisma.StringFilter,
          },
        }
      : {};

  const data = await prisma.order.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: { user: { select: { name: true } } },
  });

  const dataCount = await prisma.order.count({
    where: {
      ...queryFilter,
    },
  });

  return {
    data: convertToPlainObject(data),
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function createPayPalOrder(
  orderId: string,
  totalPrice: number | string | Decimal
): Promise<string> {
  console.log("🟢 ===== START createPayPalOrder =====");
  console.log("🟢 orderId:", orderId);
  console.log("🟢 totalPrice RAW:", totalPrice);
  console.log("🟢 typeof totalPrice:", typeof totalPrice);
  console.log("🟢 totalPrice constructor:", totalPrice?.constructor?.name);

  if (!orderId) throw new Error("Missing orderId for PayPal order");

  let total: number;

  try {
    if (
      totalPrice &&
      typeof totalPrice === "object" &&
      "toNumber" in totalPrice
    ) {
      console.log("🟢 Case: Decimal object");
      total = (totalPrice as Decimal).toNumber();
      console.log("🟢 Decimal.toNumber():", total);
    } else if (typeof totalPrice === "string") {
      console.log("🟢 Case: String");
      total = parseFloat(totalPrice);
      console.log("🟢 parseFloat(string):", total);
    } else if (typeof totalPrice === "number") {
      console.log("🟢 Case: Number");
      total = totalPrice;
      console.log("🟢 Direct number:", total);
    } else {
      console.log("🟢 Case: Fallback Number()");
      total = Number(totalPrice);
      console.log("🟢 Number():", total);
    }

    console.log("🟢 Final total:", total);
    console.log("🟢 isNaN(total):", isNaN(total));
  } catch (conversionError) {
    console.error("❌ Conversion error:", conversionError);
    console.error("❌ totalPrice that failed:", totalPrice);
    throw new Error(`Failed to convert totalPrice: ${conversionError}`);
  }

  if (isNaN(total) || total <= 0) {
    console.error("❌ Invalid total after conversion:", {
      original: totalPrice,
      converted: total,
      isNaN: isNaN(total),
    });
    throw new Error(
      `Invalid totalPrice for PayPal order: ${totalPrice} → ${total}`
    );
  }

  console.log("🟢 Getting PayPal access token...");
  const accessToken = await getPayPalAccessToken();

  console.log("🟢 Creating PayPal order with USD", total.toFixed(2));
  const res = await fetch(
    "https://api-m.sandbox.paypal.com/v2/checkout/orders",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderId,
            amount: {
              currency_code: "USD",
              value: total.toFixed(2),
            },
          },
        ],
      }),
    }
  );

  const data = await res.json();

  if (!res.ok || !data.id) {
    console.error("❌ PayPal API error:", data);
    throw new Error(data.message || "Failed to create PayPal order");
  }

  console.log("✅ PayPal order created:", data.id);
  console.log("🟢 ===== END createPayPalOrder =====");
  return data.id;
}

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_APP_SECRET;

  if (!clientId || !secret) throw new Error("PayPal credentials are missing");

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("PayPal token error:", data);
    throw new Error(
      `Failed to get access token: ${data.error_description || data.error}`
    );
  }

  return data.access_token;
}
export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });
    if (!order) throw new Error("Order not found");

    const captureData = await paypal.capturePayment(data.orderID);
    if (!captureData || captureData.status !== "COMPLETED") {
      throw new Error("Error in PayPal payment");
    }

    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer?.email_address,
        pricePaid:
          captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount
            ?.value,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "Your order has been successfully paid by PayPal",
    };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: { orderItems: true },
  });

  if (!order) throw new Error("Order not found");
  if (order.isPaid) throw new Error("Order is already paid");

  await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!updatedOrder) throw new Error("Order not found");
  return updatedOrder;
}

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });

    revalidatePath(ROUTES.ADMIN.ORDERS);

    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateOrderToPaidByCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });
    revalidatePath(`/order/${orderId}`);
    return { success: true, message: "Order paid successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error("Order not found");
    if (!order.isPaid) throw new Error("Order is not paid");

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: "Order delivered successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}
export async function updateOrderPaymentStatus(orderId: string, update: {
  isPaid: boolean;
  paidAt: string;
  paymentMethod: string;
  paymentResult: { id: string; status: string; email_address?: string };
}) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      isPaid: update.isPaid,
      paidAt: update.paidAt,
      paymentMethod: update.paymentMethod,
      paymentResult: update.paymentResult,
    },
  });
}