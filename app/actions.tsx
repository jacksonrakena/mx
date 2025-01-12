"use server";

import { auth } from "@/auth";
import { $Enums, PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();
export async function updateHomeCurrency(homeCurrency: $Enums.Currency) {
  const session = await auth();
  if (!session?.user?.email) return { error: "unauthenticated" };

  if (!Object.values($Enums.Currency).includes(homeCurrency)) {
    console.log(`${homeCurrency} is invalid`);
    return { error: "invalid currency" };
  }

  await prisma.user.update({
    where: {
      id: session.user.email,
    },
    data: {
      homeCurrency: homeCurrency,
    },
  });

  revalidatePath("/");
  return { status: "ok" };
}
