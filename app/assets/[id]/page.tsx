import { authenticate } from "@/app/users";
import { PrismaClient } from "@prisma/client";
import { Metadata, ResolvingMetadata } from "next";
import { requestConversionFactorsTable } from "../page";
import { AssetInfo } from "./_components/AssetInfo";
const prisma = new PrismaClient();

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = (await params).id;
  const auth = await authenticate();
  if (!auth.user) return {};
  const asset = await prisma.object.findFirst({
    where: {
      id: id,
      ownerId: auth.user.id,
    },
    include: {
      entries: true,
    },
  });
  if (!asset) return {};
  return {
    title: asset.name,
  };
}

export default async function AssetInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await authenticate();
  const conversionFactors = await requestConversionFactorsTable();
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
  if (!asset) return <>Not found</>;
  return (
    <>
      <AssetInfo
        asset={
          {
            ...asset,
            entries: asset?.entries.map((e) => ({
              ...e,
              unitCount: e.unitCount.toString(),
              unitValue: e.unitValue.toString(),
              totalValue: e.totalValue.toString(),
              additionalData: {},
            })),
          } as any
        }
        conversionFactors={conversionFactors}
      />
    </>
  );
}
