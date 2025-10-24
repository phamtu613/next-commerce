export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

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
