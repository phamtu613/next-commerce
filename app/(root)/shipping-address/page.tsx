import { auth } from "@/auth";
import GoToBackButton from "@/components/client/GoToBack";
import GoToCartButton from "@/components/client/GoToCartButton";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { ROUTES, createSignInUrl } from "@/lib/constants/routes";
import { Metadata } from "next";
import { redirect } from "next/navigation";

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
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Shipping Form Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              We're working on the shipping address form. This will be
              implemented in the next section.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">
                Current User Info:
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <GoToBackButton />
              <GoToCartButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressPage;
