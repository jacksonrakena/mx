"use server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const createEntrySchema = z.object({
  date: z.date(),
  unitCount: z.number().nonnegative(),
  unitValue: z.number().nonnegative(),
  currency: z.enum(["USD", "NZD", "AUD"]),
});

export async function test(assetId: string, formData: any) {
  const session = await auth();
  if (!session || !session.user?.email) return;
  const result = createEntrySchema.safeParse(formData);
  if (!result.success || !result.data) {
    return { error: result.error };
  }
  const data = result.data;

  const entry = await prisma.object.findFirst({
    where: {
      AND: [
        {
          id: assetId,
        },
        {
          owner: session.user.email,
        },
      ],
    },
  });
  if (!entry) return { error: "unauthorised" };
  await prisma.entry.create({
    data: {
      currencyCode: data.currency,
      totalValue: data.unitCount * data.unitValue,
      unitCount: data.unitCount,
      unitValue: data.unitValue,
      totalValueSource: "calc",
      unitValueSource: "manual_entry",
      unitCountSource: "manual_entry",
      objectId: assetId,
      createdAt: data.date,
    },
  });
  return { message: "success" };
}
