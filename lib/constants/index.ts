export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 20;

export const APP_NAME = "Tony Store";

export const signInDefaultValues = {
  email: "admin@example.com",
  password: "123456",
};

export const signUpDefaultValues = {
  name: "TuPV",
  email: "admin@example.com",
  password: "admin@example.com",
  confirmPassword: "admin@example.com",
};

export const shippingAddressDefaultValues = {
  fullName: "Tú Phạm",
  streetAddress: "Nguyen Nhu Dai",
  city: "Da Nang",
  postalCode: "12345",
  country: "VN",
};

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(", ")
  : ["PayPal", "Stripe", "CashOnDelivery"];

export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "PayPal";

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 2;

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(", ")
  : ["admin", "user"];

export const reviewFormDefaultValues = {
  title: "",
  description: "",
  rating: 0,
  productId: "",
  userId: "",
};
