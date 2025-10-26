import { auth } from '@/auth';
import CheckoutSteps from '@/components/shared/checkout-steps';
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
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';


export const metadata = {
  title: 'Place Order',
};

const PlaceOrderPage = async () => {
  const cart = await getMyCart();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error('User ID not found');

  const user = await getUserById(userId);

  if (!cart || cart.items.length === 0) redirect('/cart');
  if (!user.paymentMethod) redirect('/payment-method');

  // const userAddress = user?.address as ShippingAddress;

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <CheckoutSteps current={3} />

      <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">
        Review and Place Your Order
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* LEFT SECTION */}
        <div className="md:col-span-2 space-y-6">
          {/* Shipping Address */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-gray-700">
              <p className="text-sm text-gray-500 mb-2">
                No address yet. Please add your shipping address.
              </p>
              {/* Uncomment when address available
              <p className="font-medium">{userAddress?.fullName}</p>
              <p>{`${userAddress?.streetAddress}, ${userAddress?.city}, ${userAddress?.postalCode}, ${userAddress?.country}`}</p>
              */}
              <Link href="/shipping-address">
                <Button variant="outline" size="sm" className="mt-2">
                  Edit
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-gray-700">
              <p className="font-medium capitalize">
                {user.paymentMethod || 'No payment method selected'}
              </p>
              <Link href="/payment-method">
                <Button variant="outline" size="sm" className="mt-3">
                  Edit
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60%]">Product</TableHead>
                    <TableHead className="text-center w-[20%]">Qty</TableHead>
                    <TableHead className="text-right w-[20%]">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center gap-3 hover:text-blue-600 transition"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={60}
                            height={60}
                            className="rounded-md border border-gray-200"
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

        {/* RIGHT SECTION - ORDER SUMMARY */}
        <div>
          <Card className="border border-gray-200 shadow-md sticky top-4">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Order Summary
              </CardTitle>
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

              <div className="flex justify-between font-semibold text-lg text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(cart.totalPrice)}</span>
              </div>

              <Button className="w-full mt-4 text-base font-medium py-6">
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PlaceOrderPage;
