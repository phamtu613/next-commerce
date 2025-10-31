import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
const connectionString = {
  connectionString: process.env.DATABASE_URL,
};

const adapter = new PrismaNeon(connectionString);

function convertToString(value: any): string {
  if (value === null || value === undefined) return "0";

  if (
    typeof value === "object" &&
    value !== null &&
    typeof value.toString === "function"
  ) {
    try {
      return value.toString();
    } catch {
      return "0";
    }
  }

  return String(value);
}

export const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    product: {
      price: {
        compute(product: any) {
          return convertToString(product.price);
        },
      },
      rating: {
        compute(product: any) {
          return convertToString(product.rating);
        },
      },
    },
  },
});
