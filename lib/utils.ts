import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function formatError(error: any): string {
  if (error.name === "ZodError") {
    if (error.errors && Array.isArray(error.errors)) {
      const firstError = error.errors[0];
      return firstError.message || "Validation error";
    } else if (error.issues && Array.isArray(error.issues)) {
      const firstIssue = error.issues[0];
      return firstIssue.message || "Validation error";
    }
  }

  if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    const field = error.meta?.target ? error.meta.target[0] : "Field";
    const message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } already exists`;

    return message;
  }

  if (error.message && typeof error.message === "string") {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export const round2 = (value: number | string) => {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === "string") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error("value is not a number nor a string");
  }
};

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 2,
});

export function formatCurrency(amount: number | string | null) {
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(Number(amount));
  } else {
    return "NaN";
  }
}
