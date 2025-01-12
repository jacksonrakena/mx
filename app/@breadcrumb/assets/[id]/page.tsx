import { authenticate } from "@/app/users";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();
export default async function BreadcrumbSlot({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await authenticate();
  if (!auth.user) return <></>;
  const asset = await prisma.object.findFirst({
    where: {
      id: id,
      ownerId: auth.user.id,
    },
    include: {
      entries: true,
    },
  });
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/assets">Assets & liabilities</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{asset?.name ?? "Asset"}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
