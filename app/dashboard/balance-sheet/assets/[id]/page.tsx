import { PrismaClient } from "@prisma/client";
import { AssetInfo } from "./_components/AssetInfo";
const prisma = new PrismaClient();

export default async function AssetInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await prisma.object.findFirst({
    where: {
      id: id,
    },
    include: {
      entries: true,
    },
  });
  return (
    <>
      <AssetInfo
        asset={{
          ...asset,
          entries: asset?.entries.map((e) => ({
            ...e,
            unitCount: e.unitCount.toNumber(),
            unitValue: e.unitValue.toNumber(),
            totalValue: e.totalValue.toNumber(),
            additionalData: {},
          })),
        }}
      />
    </>
  );
}
