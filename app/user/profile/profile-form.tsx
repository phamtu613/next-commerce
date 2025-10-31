"use client";

import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { FormField } from "@/components/ui/form-field";
import { FormItem } from "@/components/ui/form-item";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "@/lib/actions/user.actions";
import { updateProfileSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ProfileForm = () => {
  const { data: session, update } = useSession();

  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      form.reset({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      });
    }
  }, [session, form]);

  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof updateProfileSchema>) {
    const res = await updateProfile(values);

    if (!res.success)
      return toast({
        variant: "destructive",
        description: res.message,
      });

    const newSession = {
      ...session,
      user: {
        ...session?.user,
        name: values.name,
      },
    };

    await update(newSession);

    toast({
      description: res.message,
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }: any) => (
            <FormItem className="w-full">
              <FormControl>
                <Input
                  disabled
                  placeholder="Email"
                  {...field}
                  className="input-field"
                />
              </FormControl>
              <FormMessage>{form.formState.errors.email?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }: any) => (
            <FormItem className="w-full">
              <FormControl>
                <Input placeholder="Name" {...field} className="input-field" />
              </FormControl>
              <FormMessage>{form.formState.errors.name?.message}</FormMessage>
            </FormItem>
          )}
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={form.formState.isSubmitting}
        className="button col-span-2 w-full"
      >
        {form.formState.isSubmitting ? "Submitting..." : "Update Profile"}
      </Button>
    </form>
  );
};

export default ProfileForm;
