"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  approvePayPalOrder,
  createOrder,
  createPayPalOrder,
} from "@/lib/actions/order.actions";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency } from "@/lib/utils";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function PrintLoadingState() {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  if (isPending) return <p>Loading PayPal...</p>;
  if (isRejected) return <p>Error loading PayPal.</p>;
  return null;
}

export default function PlaceOrderClient({ user, cart }: any) {
  const router = useRouter();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isOrderCreated, setIsOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const canPlaceOrder = () => {
    if (!user.address) {
      return {
        valid: false,
        message: "Please add a shipping address",
        redirectTo: "/shipping-address",
      };
    }
    if (!user.paymentMethod) {
      return {
        valid: false,
        message: "Please select a payment method",
        redirectTo: "/payment-method",
      };
    }
    if (!cart || cart.items.length === 0) {
      return {
        valid: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }
    return { valid: true };
  };

  const handlePlaceOrder = async () => {
    try {
      const check = canPlaceOrder();
      if (!check.valid) {
        toast({
          description: check.message,
          variant: "destructive",
        });
        if (check.redirectTo) {
          router.push(check.redirectTo);
        }
        return;
      }

      setIsCreatingOrder(true);

      const result = await createOrder();

      if (!result.success) {
        toast({
          description: result.message,
          variant: "destructive",
        });

        if (result.redirectTo) {
          router.push(result.redirectTo);
        }
        return;
      }

      toast({
        description: result.message,
        variant: "default",
      });

      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    } catch (error) {
      toast({
        description:
          error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleCreatePayPalOrder: any = async (data?: any, actions?: any): Promise<string> => {
    if (!cart || cart.items.length === 0) {
      throw new Error("Your cart is empty");
    }

    // Nếu đã tạo PayPal order trước đó, trả luôn
    if (paypalOrderId) {
      return paypalOrderId;
    }

    setIsCreatingOrder(true);

    try {
      const orderResult = await createOrder();

      if (!orderResult.success) {
        throw new Error(orderResult.message || "Failed to create order");
      }

      setIsOrderCreated(true);
      const createdOrderId = orderResult.redirectTo?.split("/").pop();
      setOrderId(createdOrderId || null);

      if (!createdOrderId) {
        throw new Error("Failed to determine order ID for PayPal payment.");
      }

      const payPalId = await createPayPalOrder(createdOrderId, cart.totalPrice);
      if (!payPalId) throw new Error("Failed to create PayPal order");

      setPaypalOrderId(payPalId); // lưu lại để tránh tạo lại
      return payPalId;
    } finally {
      setIsCreatingOrder(false);
    }
  };


  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    try {
      if (!orderId) {
        throw new Error("Order ID not found");
      }

      console.log("🟡 Approving payment for order:", orderId);

      const res = await approvePayPalOrder(orderId, data);

      toast({
        description: res.message,
        variant: res.success ? "default" : "destructive",
      });

      if (res.success) {
        setTimeout(() => {
          router.push(`/order/${orderId}`);
        }, 1500);
      }
    } catch (error) {
      console.error("❌ Approval error:", error);
      toast({
        description: error instanceof Error ? error.message : "Payment failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {user.address ? (
              <div className="text-sm space-y-1">
                <p className="font-semibold">{user.address.fullName}</p>
                <p>{user.address.streetAddress}</p>
                <p>
                  {user.address.city}, {user.address.postalCode}
                </p>
                <p>{user.address.country}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-red-600 mb-3">
                  ⚠️ No shipping address. Please add one before placing order.
                </p>
                <Link href={ROUTES.SHIPPING_ADDRESS}>
                  <Button variant="default" size="sm">
                    Add Shipping Address
                  </Button>
                </Link>
              </div>
            )}
            {user.address && (
              <Link href="/shipping-address">
                <Button variant="outline" size="sm" className="mt-3">
                  Edit
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {user.paymentMethod ? (
              <p className="capitalize">{user.paymentMethod}</p>
            ) : (
              <p className="text-sm text-red-600 mb-3">
                ⚠️ No payment method selected. Please select one.
              </p>
            )}
            <Link href={ROUTES.PAYMENT_METHOD}>
              <Button
                variant={user.paymentMethod ? "outline" : "default"}
                size="sm"
                className="mt-3"
              >
                {user.paymentMethod ? "Edit" : "Select Payment Method"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {cart.items && cart.items.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.items.map((item: any) => (
                      <TableRow key={item.slug}>
                        <TableCell>
                          <Link
                            href={`/product/${item.slug}`}
                            className="flex items-center gap-3 hover:text-blue-600"
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={60}
                              height={60}
                              className="rounded-md border"
                            />
                            <span>{item.name}</span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.qty}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 flex justify-end">
                  <Link href={ROUTES.CART}>
                    <Button variant="outline" size="sm">
                      Edit Cart
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm text-red-600 mb-3">Your cart is empty</p>
                <Link href={ROUTES.HOME}>
                  <Button variant="default" size="sm">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="border border-gray-200 shadow-md sticky top-4">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-gray-700">
            <div className="flex justify-between text-sm">
              <span>Items</span>
              <span>{formatCurrency(cart.itemsPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>{formatCurrency(cart.taxPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{formatCurrency(cart.shippingPrice)}</span>
            </div>

            <hr className="my-2 border-gray-200" />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatCurrency(cart.totalPrice)}</span>
            </div>

            {!canPlaceOrder().valid && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                ⚠️ {canPlaceOrder().message}
              </div>
            )}

            {user.paymentMethod === "PayPal" && canPlaceOrder().valid ? (
              <div className="mt-4">
                <PayPalScriptProvider
                  options={{
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb",
                    currency: "USD",
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
                      console.error("PayPal error:", err);
                      toast({
                        description: "PayPal error occurred",
                        variant: "destructive",
                      });
                    }}
                    onCancel={() => {
                      toast({
                        description: "Payment cancelled",
                      });
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            ) : user.paymentMethod !== "PayPal" && canPlaceOrder().valid ? (
              <Button
                className="w-full mt-4 text-base font-medium py-6"
                onClick={handlePlaceOrder}
                disabled={isCreatingOrder}
              >
                {isCreatingOrder ? "Creating Order..." : "Place Order"}
              </Button>
            ) : (
              <Button
                className="w-full mt-4 text-base font-medium py-6"
                disabled
              >
                Complete Information to Place Order
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
