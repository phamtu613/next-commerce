"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency } from "@/lib/utils";
import { Cart } from "@/types";
import { ArrowRight, Loader, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface CartTableProps {
  cart?: Cart;
}

const CartTable = ({ cart }: CartTableProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">Review your items before checkout</p>
      </div>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Your cart is empty
          </h3>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
            </svg>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart Items
                </h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="font-semibold text-gray-900">
                        Product
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center">
                        Quantity
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-right">
                        Price
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.items.map((item) => (
                      <TableRow
                        key={item.slug}
                        className="border-b hover:bg-gray-50"
                      >
                        <TableCell className="py-4">
                          <Link
                            href={`/product/${item.slug}`}
                            className="flex items-center space-x-4 group"
                          >
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                SKU: {item.productId}
                              </p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              disabled={isPending}
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                startTransition(async () => {
                                  const res = await removeItemFromCart(
                                    item.productId
                                  );
                                  if (!res.success) {
                                    toast({
                                      variant: "destructive",
                                      description: res.message,
                                    });
                                  }
                                })
                              }
                            >
                              {isPending ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Minus className="w-4 h-4" />
                              )}
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.qty}
                            </span>
                            <Button
                              disabled={isPending}
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                startTransition(async () => {
                                  const res = await addItemToCart(item);
                                  if (!res.success) {
                                    toast({
                                      variant: "destructive",
                                      description: res.message,
                                    });
                                  }
                                })
                              }
                            >
                              {isPending ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(item.price)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Items ({cart.items.reduce((a, c) => a + c.qty, 0)})
                    </span>
                    <span className="font-medium">
                      {formatCurrency(cart.itemsPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {formatCurrency(cart.shippingPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">
                      {formatCurrency(cart.taxPrice)}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-blue-600">
                        {formatCurrency(cart.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    startTransition(() => router.push(ROUTES.SHIPPING_ADDRESS))
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader className="animate-spin w-5 h-5 mr-2" />
                  ) : (
                    <ArrowRight className="w-5 h-5 mr-2" />
                  )}
                  Proceed to Checkout
                </Button>

                <div className="mt-4 text-center">
                  <Link
                    href={ROUTES.HOME}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartTable;
