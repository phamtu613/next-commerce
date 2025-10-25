"use client";

import { toast, useToast } from "@/hooks/use-toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { CartItem } from "@/types";
import { useRouter } from "next/navigation";
import router from "next/router";
import { startTransition, useTransition } from "react";

export const useCart = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async (item: CartItem) => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
        return;
      }

      toast({
        description: `${item.name} added to the cart`,
        action: (
          <button
            className="bg-primary text-white hover:bg-gray-800 px-3 py-1 rounded text-sm"
            onClick={() => router.push("/cart")}
          >
            Go to cart
          </button>
        ),
      });
    });
  };

  const handleRemoveFromCart = async (productId: string) => {
    startTransition(async () => {
      const res = await removeItemFromCart(productId);

      toast({
        variant: res.success ? "default" : "destructive",
        description: res.message,
      });
    });
  };

  return {
    handleAddToCart,
    handleRemoveFromCart,
    isPending,
  };
};
