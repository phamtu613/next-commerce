"use client";

import { z } from "zod";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { PopoverContent } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Category } from "@prisma/client";
import { transactionFormSchema } from "@/lib/schema/transaction";

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

type Props = {
  categories: Category[];
  onSubmit: (data: TransactionFormValues) => Promise<void>;
  defaultValues?: TransactionFormValues;
};

export function TransactionForm({
  categories,
  onSubmit,
  defaultValues,
}: Props) {
  const form = useForm<TransactionFormValues>({
    defaultValues: {
      amount: 0,
      categoryId: 0,
      description: "",
      transactionDate: new Date(),
      transactionType: "INCOME",
      ...defaultValues,
    },
    resolver: zodResolver(
      transactionFormSchema
    ) as Resolver<TransactionFormValues>,
  });

  const { watch } = form;
  const transactionType = watch("transactionType");

  const filteredCategories = categories.filter(
    (category) => category.type === transactionType
  );

  const handleSubmitForm = (data: TransactionFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)}>
        <fieldset
          disabled={form.formState.isSubmitting}
          className="grid grid-cols-2 gap-y-5 gap-x-2 items-start"
        >
          <FormField
            control={form.control}
            name="transactionType"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(newValue) => {
                        field.onChange(newValue);
                        form.setValue("categoryId", 0);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value.toString()}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="transactionDate"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Transaction Date</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={{
                            after: new Date(),
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </fieldset>
        <fieldset
          disabled={form.formState.isSubmitting}
          className="mt-5 flex flex-col gap-5"
        >
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button type="submit">Submit</Button>
        </fieldset>
      </form>
    </Form>
  );
}
