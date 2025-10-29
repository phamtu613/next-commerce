import { auth } from "@/auth";
import { getUserById } from "@/lib/actions/user.actions";
import { ROUTES, createSignInUrl } from "@/lib/constants/routes";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import PaymentMethodForm from "./payment-method-form";

export const metadata: Metadata = {
  title: "Payment Method",
};

const PaymentMethodPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect(createSignInUrl(ROUTES.PAYMENT_METHOD));
  }

  const user = await getUserById(userId);

  return (
    <>
      <PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />
    </>
  );
};

export default PaymentMethodPage;
