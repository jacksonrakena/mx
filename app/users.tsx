import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { AppSession } from "./providers/AppSessionProvider";

const prisma = new PrismaClient();
export const authenticate: () => Promise<AppSession> = async () => {
  const session = await auth();

  if (!session || !session.user?.email)
    return { state: "unauthenticated", user: null };

  let user = await prisma.user.findFirst({
    where: {
      id: session.user.email,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: session.user.email,
        homeCurrency: "NZD",
      },
    });
  }

  return { state: "authenticated", user };
};
