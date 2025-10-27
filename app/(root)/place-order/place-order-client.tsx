'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import {
  approvePayPalOrder,
  createPayPalOrder,
} from '@/lib/actions/order.actions';

function PrintLoadingState() {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  if (isPending)
    return <p className="text-sm text-gray-500 mt-2">Loading PayPal...</p>;
  if (isRejected)
    return (
      <p className="text-sm text-red-500 mt-2">
        Failed to load PayPal. Please refresh.
      </p>
    );
  return null;
}

export default function PlaceOrderClient({ user, cart }: any) {
  const handleCreatePayPalOrder = async () => {
  try {
    console.log('🔵 Step 1: Starting createPayPalOrder');
    console.log('🔵 Order ID:', order.id);
    
    const res = await createPayPalOrder(order.id);
    
    console.log('🔵 Step 2: Server response:', res);
    console.log('🔵 Step 3: res.success:', res.success);
    console.log('🔵 Step 4: res.data:', res.data);
    console.log('🔵 Step 5: typeof res.data:', typeof res.data);
    
    if (!res.success) {
      console.error('❌ Server returned error:', res.message);
      toast({
        description: res.message || 'Failed to create PayPal order',
        variant: 'destructive',
      });
      throw new Error(res.message);
    }

    if (!res.data || typeof res.data !== 'string') {
      console.error('❌ Invalid order ID:', res.data);
      throw new Error('Invalid PayPal order ID received');
    }

    console.log('✅ Step 6: Returning PayPal order ID:', res.data);
    
    // 👇 QUAN TRỌNG: Phải return một STRING
    return res.data;
    
  } catch (error) {
    console.error('❌ Error in handleCreatePayPalOrder:', error);
    console.error('❌ Error stack:', error.stack);
    toast({
      description: error instanceof Error ? error.message : 'Failed to create order',
      variant: 'destructive',
    });
    throw error;
  }
};

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(cart.id, data);
    toast({
      description: res.message,
      variant: res.success ? 'default' : 'destructive',
    });
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
          <CardContent>
            <p className="text-sm text-gray-500 mb-2">
              No address yet. Please add your shipping address.
            </p>
            <Link href="/shipping-address">
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="capitalize">{user.paymentMethod}</p>
            <Link href="/payment-method">
              <Button variant="outline" size="sm" className="mt-3">
                Edit
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
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

            {user.paymentMethod === 'PayPal' && (
              <div className="mt-4">
                <PayPalScriptProvider
                  options={{
                    clientId: process.env.PAYPAL_CLIENT_ID || 'sb',
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
                  />
                </PayPalScriptProvider>
              </div>
            )}

            <Button className="w-full mt-4 text-base font-medium py-6">
              Place Order
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
