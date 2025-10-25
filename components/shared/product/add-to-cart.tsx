"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Cart, CartItem } from "@/types";
import { Loader, Minus, Plus } from "lucide-react";

interface AddToCartProps {
  cart?: Cart;
  item: Omit<CartItem, "cartId">;
}

const AddToCart = ({ cart, item }: AddToCartProps) => {
  const { handleAddToCart, handleRemoveFromCart, isPending } = useCart();
  const existItem = cart?.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => handleRemoveFromCart(item.productId)}
          className="w-10 h-10 rounded-full"
        >
          {isPending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Minus className="w-4 h-4" />
          )}
        </Button>
        <div className="w-12 h-10 flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50">
          <span className="font-semibold text-gray-900">{existItem.qty}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => handleAddToCart(item)}
          className="w-10 h-10 rounded-full"
        >
          {isPending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>
      <div className="">
        <p className="text-sm text-gray-600">
          {existItem.qty} {existItem.qty === 1 ? "item" : "items"} in cart
        </p>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
        type="button"
        disabled={isPending}
        onClick={() => handleAddToCart(item)}
      >
        {isPending ? (
          <Loader className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <Plus className="w-5 h-5 mr-2" />
        )}
        Add to Cart
      </Button>
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Free shipping on orders over $100
        </p>
      </div>
    </div>
  );
};

export default AddToCart;
