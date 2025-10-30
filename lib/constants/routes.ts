export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  PRODUCT: {
    BASE: "/product",
    BY_SLUG: (slug: string) => `/product/${slug}`,
  },
  CART: "/cart",
  SHIPPING_ADDRESS: "/shipping-address",
  PAYMENT_METHOD: "/payment-method",
  PLACE_ORDER: "/place-order",
  ORDER: {
    BASE: "/order",
    BY_ID: (id: string) => `/order/${id}`,
  },
  USER: {
    BASE: "/user",
    PROFILE: "/user/profile",
    ORDERS: "/user/orders",
  },
  ADMIN: {
    BASE: "/admin",
    OVERVIEW: "/admin/overview",
    PRODUCTS: "/admin/products",
    ORDERS: "/admin/orders",
    USERS: "/admin/users",
  },
} as const;
export const createSignInUrl = (callbackUrl?: string) => {
  if (!callbackUrl) return ROUTES.SIGN_IN;
  return `${ROUTES.SIGN_IN}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
};
export const createProductUrl = (slug: string) => {
  return ROUTES.PRODUCT.BY_SLUG(slug);
};
export const createOrderUrl = (id: string) => {
  return ROUTES.ORDER.BY_ID(id);
};
