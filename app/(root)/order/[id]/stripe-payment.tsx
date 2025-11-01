"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface StripePaymentProps {
  priceInCents: number;
  orderId: string;
  clientSecret: string;
}

const CheckoutForm = ({ orderId, priceInCents }: { orderId: string; priceInCents: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/${orderId}`,
      },
      redirect: "if_required",
    });

    setIsProcessing(false);

    if (error) {
      toast({
        description: error.message || "Payment failed",
        variant: "destructive",
      });
    } else if (paymentIntent?.status === "succeeded") {
      toast({
        description: `Payment successful! (${formatCurrency(priceInCents / 100)})`,
        variant: "default",
      });
      setTimeout(() => {
        window.location.href = `/`;
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
      >
        {isProcessing
          ? "Processing..."
          : `Pay Now - ${formatCurrency(priceInCents / 100)}`}
      </button>
    </form>
  );
};

const StripePayment = ({ clientSecret, orderId, priceInCents }: StripePaymentProps) => {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

  if (!clientSecret) return null;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm orderId={orderId} priceInCents={priceInCents} />
    </Elements>
  );
};

export default StripePayment;
