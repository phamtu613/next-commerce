import { Prisma } from "@prisma/client";

export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
}

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}
export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomDecimal(min: number, max: number, precision = 2) {
  return new Prisma.Decimal(
    (Math.random() * (max - min) + min).toFixed(precision)
  )
}
