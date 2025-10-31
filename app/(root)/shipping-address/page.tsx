import { auth } from "@/auth";
import GoToBackButton from "@/components/client/GoToBack";
import GoToCartButton from "@/components/client/GoToCartButton";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { ROUTES, createSignInUrl } from "@/lib/constants/routes";
import { ShippingAddress } from "@/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import ShippingAddressForm from "./shipping-address-form";

export const metadata: Metadata = {
  title: "Shipping Address",
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect(ROUTES.CART);

  const session = await auth();

  const userId = session?.user?.id;

  if (!userId) {
    redirect(createSignInUrl(ROUTES.SHIPPING_ADDRESS));
  }

  const user = await getUserById(userId);

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps current={1} />

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shipping Address
          </h1>
          <p className="text-gray-600">Enter your delivery information</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <ShippingAddressForm
            address={(user.address as ShippingAddress) || null}
          />
          <div className="mt-6 flex space-x-4">
            <GoToBackButton />
            <GoToCartButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressPage;
