"use server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const createAssetSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["ASSET", "LIABILITY"]),
  provider: z.enum(["Manual entry"]),
});
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
      owner: session.user.email,
      type: data.type,
      unitCountProvider: "manual_entry",
      unitValueProvider: "manual_entry",
    },
  });
}
