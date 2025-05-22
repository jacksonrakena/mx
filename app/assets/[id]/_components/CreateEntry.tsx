"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createLedgerEntry } from "../actions";
import { $Enums } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
const createEntrySchema = z.object({
  date: z.date(),
  unitCount: z.number({ coerce: true }).nonnegative(),
  unitValue: z.number({ coerce: true }).nonnegative(),
  currency: z.enum(["USD", "NZD", "AUD"]),
});

export const CreateEntry = ({
  assetId,
  defaultCurrency,
}: {
  assetId: string;
  defaultCurrency: $Enums.Currency;
}) => {
  const form = useForm<z.infer<typeof createEntrySchema>>({
    resolver: zodResolver(createEntrySchema),
    defaultValues: {
      unitCount: 0,
      unitValue: 0,
      currency: defaultCurrency,
      date: new Date(),
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  const sendWithAssetId = createLedgerEntry.bind(null, assetId);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (valuation) => {
          await sendWithAssetId(valuation);
        })}
        ref={formRef}
        className="space-y-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Record new valuation</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex">
              <div>
                {" "}
                <div className="grid grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[200px] justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </FormControl>
                        <FormDescription>
                          The date of the valuation of this asset.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Select {...field} onValueChange={field.onChange}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue {...field} />
                            </SelectTrigger>
                            <SelectContent>
                              {["NZD", "AUD", "USD"].map((currency) => (
                                <SelectItem key={currency} value={currency}>
                                  {currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          The base currency of the asset.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="unitCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of units held</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        The number of units of this asset held at the valuation
                        date.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit value</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        The value of each individual unit.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              <div>
                <div className="content-center">
                  <div className="flex-col items-center">
                    <div>{form.getValues().unitCount}</div>
                    <div>x</div>
                    <div>
                      {form.getValues().unitValue} {form.getValues().currency}
                    </div>
                    <div>=</div>
                    <div>
                      {form.getValues().currency}$
                      {form.getValues().unitValue * form.getValues().unitCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
};
