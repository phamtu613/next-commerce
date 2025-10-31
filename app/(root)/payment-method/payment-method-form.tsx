"use client";

import CheckoutSteps from "@/components/shared/checkout-steps";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "@/lib/constants";
import { ROUTES } from "@/lib/constants/routes";
import { paymentMethodSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { FormField } from "@/components/ui/form-field";
import { FormItem } from "@/components/ui/form-item";
import { FormLabel } from "@/components/ui/form-label";
import { FormMessage } from "@/components/ui/form-message";
import { RadioGroup } from "@/components/ui/radio-group";
import { updateUserPaymentMethod } from "@/lib/actions/user.actions";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader } from "lucide-react";

const PaymentMethodForm = ({
  preferredPaymentMethod,
}: {
  preferredPaymentMethod: string | null;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: { type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD },
  });
  async function onSubmit(values: z.infer<typeof paymentMethodSchema>) {
    try {
      const res = await updateUserPaymentMethod(values);
      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
        return;
      }
      startTransition(() => {
        router.push(ROUTES.PLACE_ORDER);
        router.refresh();
      });
    } catch (err) {
      console.error("❌ onSubmit error:", err);
    }
  }

  return (
    <>
      <CheckoutSteps current={2} />
      <div className="max-w-md mx-auto mt-6 space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h1 className="text-2xl font-bold">Payment Method</h1>
          <p className="text-sm text-muted-foreground">
            Please select your preferred payment method
          </p>

          <FormField
            control={form.control}
            name="type"
            render={({ field }: any) => (
              <FormItem className="space-y-2">
                <FormLabel>Select Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-col gap-3"
                  >
                    {PAYMENT_METHODS.map((method) => {
                      const selected = field.value === method;
                      return (
                        <label
                          key={method}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition",
                            selected
                              ? "bg-blue-500 border-blue-500 text-white"
                              : "bg-white border-gray-300 text-gray-900 hover:bg-blue-100 hover:border-blue-500"
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center border transition",
                              selected
                                ? "bg-white border-white"
                                : "border-gray-300 bg-white"
                            )}
                          >
                            {selected && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <span>{method}</span>
                          <input
                            type="radio"
                            value={method}
                            className="sr-only"
                            checked={selected}
                            onChange={() => field.onChange(method)}
                          />
                        </label>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2"
          >
            {isPending ? (
              <Loader className="animate-spin w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            Continue
          </Button>
        </form>
      </div>
    </>
  );
};

export default PaymentMethodForm;
