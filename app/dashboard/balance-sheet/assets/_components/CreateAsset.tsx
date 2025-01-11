"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createAsset } from "../actions";
const createAssetSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["ASSET", "LIABILITY"]),
  provider: z.enum(["Manual entry"]),
});

export const CreateAsset = () => {
  const form = useForm<z.infer<typeof createAssetSchema>>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      provider: "Manual entry",
      type: "ASSET",
      name: "",
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => formRef.current?.submit())}
        ref={formRef}
        action={createAsset}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="SSgA Active Trust - SPDR S&P 500 ETF Trust"
                  {...field}
                />
              </FormControl>
              <FormDescription>The name of the asset.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={"Asset"} {...field} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSET">Asset</SelectItem>
                    <SelectItem value="LIABILITY">Liability</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>The type of the asset.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} {...field}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue {...field} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual entry">Manual entry</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                How records about the entity are obtained.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );

  return <></>;
};
