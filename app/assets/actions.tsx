"use server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const prisma = new PrismaClient();
const createAssetSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["ASSET", "LIABILITY"]),
  provider: z.enum(["Manual entry"]),
});
export async function deleteAsset(assetId: string) {
  const session = await auth();
  if (!session || !session.user?.email) return;
  const entry = await prisma.object.delete({
    where: {
      id: assetId,
      AND: { ownerId: session.user.email },
    },
  });
  if (!entry) return { error: "unauthorised" };

  revalidatePath(`/assets`);
  return { status: "ok" };
}
export async function createAsset(formData: FormData) {
  const session = await auth();
  if (!session || !session.user?.email) return { error: "unauthorized" };
  const result = createAssetSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!result.success) {
    console.log(result.error);
    return {
      error: result.error,
    };
  }
  const data = result.data;

  await prisma.object.create({
    data: {
      name: data.name,
      ownerId: session.user.email,
      type: data.type,
      unitCountProvider: "manual_entry",
      unitValueProvider: "manual_entry",
    },
  });
}
