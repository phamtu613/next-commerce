import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import React from "react";

interface CheckoutStepsProps {
  current?: number;
}

const CheckoutSteps = ({ current = 0 }: CheckoutStepsProps) => {
  const steps = [
    { name: "User Login", description: "Sign in to your account" },
    { name: "Shipping Address", description: "Enter delivery details" },
    { name: "Payment Method", description: "Choose payment option" },
    { name: "Place Order", description: "Review and confirm" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.name}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200",
                  index <= current
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {index < current ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-sm font-medium",
                    index <= current ? "text-blue-600" : "text-gray-500"
                  )}
                >
                  {step.name}
                </p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-colors duration-200",
                  index < current ? "bg-blue-600" : "bg-gray-200"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CheckoutSteps;
