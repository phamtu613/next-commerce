import { auth } from "@/auth";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { ROUTES } from "@/lib/constants/routes";
import { redirect } from "next/navigation";
import PlaceOrderClient from "./place-order-client";

export const metadata = {
  title: "Place Order",
};

const PlaceOrderPage = async () => {
  const cart = await getMyCart();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("User ID not found");

  const user = await getUserById(userId);

  if (!cart || cart.items.length === 0) redirect(ROUTES.CART);
  if (!user.paymentMethod) redirect(ROUTES.PAYMENT_METHOD);

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <CheckoutSteps current={3} />
      <PlaceOrderClient user={user} cart={cart} />
    </section>
  );
};

export default PlaceOrderPage;
