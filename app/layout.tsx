import "@/assets/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tony store",
  description: "An e-commerce store built with Next.js, ShadCN, and Prisma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      
      <body className={`${inter.className}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
