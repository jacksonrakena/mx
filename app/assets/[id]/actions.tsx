"use server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const prisma = new PrismaClient();
const createEntrySchema = z.object({
  date: z.date(),
  unitCount: z.number().nonnegative(),
  unitValue: z.number().nonnegative(),
  currency: z.enum(["USD", "NZD", "AUD"]),
});

export async function deleteLedgerEntry(objectId: string, entryId: string) {
  const session = await auth();
  if (!session || !session.user?.email) return;
  const entry = await prisma.entry.delete({
    where: {
      id: entryId,
      AND: { object: { ownerId: session.user.email } },
    },
  });
  if (!entry) return { error: "unauthorised" };

  revalidatePath(`/assets/${objectId}`);
  return { status: "ok" };
}

export async function createLedgerEntry(assetId: string, formData: any) {
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
          ownerId: session.user.email,
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
  revalidatePath(`/assets/${assetId}`);
  return { message: "success" };
}
