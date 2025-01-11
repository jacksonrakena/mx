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
  if (!asset) return <>Not found</>;
  console.log(asset.entries[0].unitCount);
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
      />
    </>
  );
}
