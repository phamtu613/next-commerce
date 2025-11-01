'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { createOrder, createPayPalOrder, approvePayPalOrder } from '@/lib/actions/order.actions';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

function PrintLoadingState() {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  if (isPending) return <p>Loading PayPal...</p>;
  if (isRejected) return <p>Error loading PayPal.</p>;
  return null;
}

export default function PlaceOrderClient({ user, cart }: any) {
  const router = useRouter();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // 🔴 Kiểm tra điều kiện trước khi cho phép đặt hàng
  const canPlaceOrder = () => {
    if (!user.address) {
      return { valid: false, message: 'Please add a shipping address', redirectTo: '/shipping-address' };
    }
    if (!user.paymentMethod) {
      return { valid: false, message: 'Please select a payment method', redirectTo: '/payment-method' };
    }
    if (!cart || cart.items.length === 0) {
      return { valid: false, message: 'Your cart is empty', redirectTo: '/cart' };
    }
    return { valid: true };
  };

  // 🟦 Tạo order trong DB trước (cho Cash on Delivery)
  // const handlePlaceOrder = async () => {
  //   try {
  //     // Kiểm tra điều kiện
  //     const check = canPlaceOrder();
  //     if (!check.valid) {
  //       toast({
  //         description: check.message,
  //         variant: 'destructive',
  //       });
  //       if (check.redirectTo) {
  //         router.push(check.redirectTo);
  //       }
  //       return;
  //     }

  //     setIsCreatingOrder(true);

  //     const result = await createOrder();

  //     if (!result.success) {
  //       toast({
  //         description: result.message,
  //         variant: 'destructive',
  //       });

  //       if (result.redirectTo) {
  //         router.push(result.redirectTo);
  //       }
  //       return;
  //     }

  //     toast({
  //       description: result.message,
  //       variant: 'default',
  //     });

  //     // Redirect đến trang order detail
  //     if (result.redirectTo) {
  //       router.push(result.redirectTo);
  //     }
  //   } catch (error) {
  //     toast({
  //       description: error instanceof Error ? error.message : 'Failed to create order',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setIsCreatingOrder(false);
  //   }
  // };

  // 🟩 Tạo PayPal order
  // const handleCreatePayPalOrder = async () => {
  //   try {
  //     console.log('🔵 Step 1: Validating order conditions...');
  //     const check = canPlaceOrder();
  //     if (!check.valid) {
  //       toast({ description: check.message, variant: 'destructive' });
  //       throw new Error(check.message);
  //     }

  //     console.log('🔵 Step 2: Creating order in database...');

  //     const orderResult = await fetch('/api/order/create', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ cartId: cart.id, userId: user.id }),
  //     }).then((res) => res.json());

  //     console.log('🔵 Order result:', orderResult);

  //     if (!orderResult.success) {
  //       toast({ description: orderResult.message, variant: 'destructive' });
  //       throw new Error(orderResult.message);
  //     }

  //     const createdOrderId = orderResult.orderId;
  //     if (!createdOrderId) throw new Error('Failed to get order ID');

  //     console.log('🔵 Step 3: Order created with ID:', createdOrderId);
  //     console.log('🔵 Step 4: Creating PayPal order...');
  //     const paypalOrderId = await createPayPalOrder(createdOrderId, cart.totalPrice);

  //     console.log('✅ PayPal order created:', paypalOrderId);
  //     setOrderId(createdOrderId);
  //     return paypalOrderId;
  //   } catch (error) {
  //     console.error('❌ Error in handleCreatePayPalOrder:', error);
  //     throw error;
  //   }
  // };
  // 🟩 Tạo đơn hàng thường (COD / Stripe)
const handlePlaceOrder = async () => {
  try {
    const check = canPlaceOrder();
    if (!check.valid) {
      toast({
        description: check.message,
        variant: "destructive",
      });
      if (check.redirectTo) router.push(check.redirectTo);
      return;
    }

    setIsCreatingOrder(true);

    // 🧾 Chuẩn bị dữ liệu gửi backend
    const orderPayload = {
      userId: user.id,
      cartId: cart.id, // 🟢 thêm dòng này
      shippingAddress:user.address,
      paymentMethod:user.paymentMethod,
      cartItems: cart.items.map((item:any) => ({
        productId: item.id,
        name: item.name,
        slug: item.slug,
        image: item.image,
        qty: item.quantity,
        price: item.price,
      })),
      prices: {
        itemsPrice: cart.items.reduce((sum:any, i:any) => sum + i.price * i.quantity, 0),
        shippingPrice:cart.shippingPrice,
        taxPrice:cart.taxPrice,
        totalPrice:cart.totalPrice,
      },
    };


    // 🧩 Gọi API tạo đơn hàng
    const res = await fetch("/api/order/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const result = await res.json();

    if (!result.success) {
      toast({ description: result.message, variant: "destructive" });
      if (result.redirectTo) router.push(result.redirectTo);
      return;
    }

    toast({ description: result.message, variant: "default" });

    if (result.redirectTo) router.push(result.redirectTo);
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

// 🟦 Tạo đơn hàng PayPal
const handleCreatePayPalOrder = async () => {
  try {
    console.log("🔵 Step 1: Validating order conditions...");
    const check = canPlaceOrder();
    if (!check.valid) {
      toast({ description: check.message, variant: "destructive" });
      throw new Error(check.message);
    }

    setIsCreatingOrder(true);

    console.log("🔵 Step 2: Creating order in database...");
// 🟩 Giả sử cart hoặc form của bạn có thông tin địa chỉ giao hàng
    const shippingAddress = cart.shippingAddress || {
      fullName: user.name,
      address: '123 Test Street',
      city: 'Hanoi',
      country: 'Vietnam',
      postalCode: '100000',
    };
    const itemsPrice = cart.itemsPrice || 0;
    const shippingPrice = cart.shippingPrice || 0;
    const taxPrice = cart.taxPrice || 0;
    const totalPrice = cart.totalPrice || 0;
    // 🧾 Gửi toàn bộ thông tin giỏ hàng sang backend
    const orderPayload = {
      userId: user.id,
      shippingAddress,
      paymentMethod: "PayPal",
      cartItems: cart.items.map((item:any) => ({
        productId: item.id,
        name: item.name,
        slug: item.slug,
        image: item.image,
        qty: item.quantity,
        price: item.price,
      })),
      prices: {
        itemsPrice: cart.items.reduce((sum:any, i:any) => sum + i.price * i.quantity, 0),
        shippingAddress,
        taxPrice,
        totalPrice:
          cart.items.reduce((sum:any, i:any) => sum + i.price * i.quantity, 0) +
          shippingPrice +
          taxPrice,
      },
    };

    const orderResult = await fetch("/api/order/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    }).then((res) => res.json());

    console.log("🔵 Order result:", orderResult);

    if (!orderResult.success) {
      toast({ description: orderResult.message, variant: "destructive" });
      throw new Error(orderResult.message);
    }

    const createdOrderId = orderResult.orderId;
    if (!createdOrderId) throw new Error("Failed to get order ID");

    console.log("🔵 Step 3: Order created with ID:", createdOrderId);
    console.log("🔵 Step 4: Creating PayPal order...");

    // 🟨 Gọi đến PayPal API để tạo đơn hàng thực tế
    const paypalOrderId = await createPayPalOrder(
      createdOrderId,
      orderResult.totalPrice || cart.totalPrice
    );

    console.log("✅ PayPal order created:", paypalOrderId);
    setOrderId(createdOrderId);
    return paypalOrderId;
  } catch (error) {
    console.error("❌ Error in handleCreatePayPalOrder:", error);
    toast({
      description:
        error instanceof Error ? error.message : "PayPal order failed",
      variant: "destructive",
    });
    throw error;
  } finally {
    setIsCreatingOrder(false);
  }
};


  // 🟨 Approve PayPal payment
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    try {
      if (!orderId) {
        throw new Error('Order ID not found');
      }

      console.log('🟡 Approving payment for order:', orderId);

      const res = await approvePayPalOrder(orderId, data);

      toast({
        description: res.message,
        variant: res.success ? 'default' : 'destructive',
      });

      if (res.success) {
        // Redirect đến order detail page
        setTimeout(() => {
          router.push(`/order/${orderId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Approval error:', error);
      toast({
        description: error instanceof Error ? error.message : 'Payment failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* LEFT SECTION */}
      <div className="md:col-span-2 space-y-6">
        {/* Shipping Address */}
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
                <Link href="/shipping-address">
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

        {/* Payment Method */}
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
            <Link href="/payment-method">
              <Button
                variant={user.paymentMethod ? "outline" : "default"}
                size="sm"
                className="mt-3"
              >
                {user.paymentMethod ? 'Edit' : 'Select Payment Method'}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Order Items */}
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
                        <TableCell className="text-center">{item.qty}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 flex justify-end">
                  <Link href="/cart">
                    <Button variant="outline" size="sm">
                      Edit Cart
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm text-red-600 mb-3">
                  Your cart is empty
                </p>
                <Link href="/">
                  <Button variant="default" size="sm">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT SECTION */}
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

            {/* Hiển thị warning nếu thiếu thông tin */}
            {!canPlaceOrder().valid && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                ⚠️ {canPlaceOrder().message}
              </div>
            )}

            {/* PayPal Payment */}
            {user.paymentMethod === 'PayPal' && canPlaceOrder().valid ? (
              <div className="mt-4">
                <PayPalScriptProvider
                  options={{
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb',
                    currency: 'USD',
                  }}
                >
                  <PrintLoadingState />
                  <PayPalButtons
                    style={{
                      layout: 'vertical',
                      color: 'gold',
                      shape: 'rect',
                      label: 'paypal',
                    }}
                    createOrder={handleCreatePayPalOrder}
                    onApprove={handleApprovePayPalOrder}
                    onError={(err) => {
                      console.error('PayPal error:', err);
                      toast({
                        description: 'PayPal error occurred',
                        variant: 'destructive',
                      });
                    }}
                    onCancel={() => {
                      toast({
                        description: 'Payment cancelled',
                      });
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            ) : user.paymentMethod !== 'PayPal' && canPlaceOrder().valid ? (
              /* Cash on Delivery hoặc payment method khác */
              <Button
                className="w-full mt-4 text-base font-medium py-6"
                onClick={handlePlaceOrder}
                disabled={isCreatingOrder}
              >
                {isCreatingOrder ? 'Creating Order...' : 'Place Order'}
              </Button>
            ) : (
              /* Disable button nếu thiếu thông tin */
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