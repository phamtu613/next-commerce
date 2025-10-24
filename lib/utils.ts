import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function formatError(error: any): { message: string; field?: string } {
  if (error.name === "ZodError") {
    if (error.errors && Array.isArray(error.errors)) {
      const firstError = error.errors[0];
      return {
        message: firstError.message || "Validation error",
        field: firstError.path?.[0] || undefined,
      };
    } else if (error.issues && Array.isArray(error.issues)) {
      const firstIssue = error.issues[0];
      return {
        message: firstIssue.message || "Validation error",
        field: firstIssue.path?.[0] || undefined,
      };
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

    return {
      message: message,
      field: field,
    };
  }

  if (error.message && typeof error.message === "string") {
    return { message: error.message };
  }

  return { message: "Something went wrong. Please try again." };
}
