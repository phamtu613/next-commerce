"use client";

import { useRouter } from "next/navigation";

export default function GoToCartButton() {
  const router = useRouter();

  return (
    <button
      className="bg-primary text-white hover:bg-gray-800 px-3 py-1 rounded text-sm"
      onClick={() => router.push("/payment-method")}
    >
      Go to cart
    </button>
  );
}
