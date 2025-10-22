import { z } from 'zod';
import { insertProductSchema } from '@/lib/validator';
import { DefaultSession } from 'next-auth';

export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  createdAt: Date;
  rating: string;
  numReviews: number;
};
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string; // 👈 thêm role vào session
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string; // 👈 thêm role vào User
  }
}