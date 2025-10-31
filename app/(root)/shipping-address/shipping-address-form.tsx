"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateUserAddress } from "@/lib/actions/user.actions";
import { shippingAddressDefaultValues } from "@/lib/constants";
import { ROUTES } from "@/lib/constants/routes";
import { shippingAddressSchema } from "@/lib/validator";
import { ShippingAddress } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { z } from "zod";

const ShippingAddressForm = ({
  address,
}: {
  address: ShippingAddress | null;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || shippingAddressDefaultValues,
  });

  const onSubmit = async (values: z.infer<typeof shippingAddressSchema>) => {
    startTransition(async () => {
      const res = await updateUserAddress(values);

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
        return;
      }

      toast({
        description: res.message,
      });

      router.push(ROUTES.PAYMENT_METHOD);
    });
  };

  return (
    <Form {...form}>
      <form
        method="post"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="fullName"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                "fullName"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="streetAddress"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                "streetAddress"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="city"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                "city"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postalCode"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                "postalCode"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter postal code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="country"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                "country"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Enter country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader className="animate-spin w-4 h-4 mr-2" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ShippingAddressForm;
