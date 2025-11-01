import { Cart, CartItem } from "@/types";

export const getCartItemCount = (cart?: Cart): number => {
  if (!cart?.items) return 0;
  return cart.items.reduce((total, item) => total + item.qty, 0);
};

export const getCartTotal = (cart?: Cart): number => {
  if (!cart?.items) return 0;
  return cart.items.reduce(
    (total, item) => total + Number(item.price) * item.qty,
    0
  );
};

export const findCartItem = (
  cart?: Cart,
  productId: string
): CartItem | undefined => {
  if (!cart?.items) return undefined;
  return cart.items.find((item) => item.productId === productId);
};

export const isProductInCart = (cart?: Cart, productId: string): boolean => {
  return !!findCartItem(cart, productId);
};

export const getCartSummary = (cart?: Cart) => {
  if (!cart) {
    return {
      itemCount: 0,
      totalPrice: 0,
      isEmpty: true,
    };
  }

  const itemCount = getCartItemCount(cart);
  const totalPrice = Number(cart.totalPrice);

  return {
    itemCount,
    totalPrice,
    isEmpty: itemCount === 0,
  };
};
