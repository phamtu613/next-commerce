"use client";

import { Badge } from "@/components/ui/badge";
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
import {
  deliverOrder,
  updateOrderToPaidByCOD,
} from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Order } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";

const OrderDetailsTable = ({
  order,
  paypalClientId,
  isAdmin,
}: {
  order: Omit<Order, 'paymentResult'>
  paypalClientId: string;
  isAdmin: boolean;
}) => {
  const { toast } = useToast();

  const {
    shippingAddress,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;

  return (
    <>
      <h1 className="py-6 text-3xl font-semibold text-gray-800">
        Order{" "}
        <span className="text-muted-foreground">#{formatId(order.id)}</span>
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-5 space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">
                Payment Method
              </h2>
              <p className="capitalize">{paymentMethod}</p>
              {isPaid ? (
                <Badge variant="secondary">
                  Paid at {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not paid</Badge>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-5 space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">
                Shipping Address
              </h2>
              <p className="font-medium">{shippingAddress.fullName}</p>
              <p className="text-gray-700">
                {shippingAddress.streetAddress}, {shippingAddress.city},{" "}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
              {isDelivered ? (
                <Badge variant="secondary">
                  Delivered at {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not delivered</Badge>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold text-gray-800 pb-4">
                Order Items
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center gap-3 hover:text-blue-600 transition"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
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
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-md border-gray-200 sticky top-4">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 pb-2">
                Order Summary
              </h2>
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {isAdmin && !isPaid && paymentMethod === "CashOnDelivery" && (
                <MarkAsPaidButton order={order} />
              )}
              {isAdmin && isPaid && !isDelivered && (
                <MarkAsDeliveredButton order={order} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

const MarkAsPaidButton = ({ order }: { order: Omit<Order, 'paymentResult'> }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await updateOrderToPaidByCOD(order.id);
          toast({
            variant: res.success ? "default" : "destructive",
            description: res.message,
          });
        })
      }
    >
      {isPending ? "processing..." : "Mark As Paid"}
    </Button>
  );
};

const MarkAsDeliveredButton = ({ order }: { order: Order }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await deliverOrder(order.id);
          toast({
            variant: res.success ? "default" : "destructive",
            description: res.message,
          });
        })
      }
    >
      {isPending ? "processing..." : "Mark As Delivered"}
    </Button>
  );
};

export default OrderDetailsTable;
