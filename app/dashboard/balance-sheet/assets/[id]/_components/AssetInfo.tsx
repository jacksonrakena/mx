"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { CreateEntry } from "./CreateEntry";

export const AssetInfo = ({
  asset,
}: {
  asset: Prisma.ObjectGetPayload<{ include: { entries: true } }>;
}) => {
  const router = useRouter();
  return (
    <>
      <Dialog
        open={true}
        onOpenChange={() => {
          router.push(`/dashboard/balance-sheet/assets/`);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{asset?.name}</DialogTitle>
            <DialogDescription>
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead>Units held</TableHead>
                      <TableHead>Unit value</TableHead>
                      <TableHead>Total value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(asset.entries ?? []).map((entry) => (
                      <TableRow>
                        <TableCell>
                          {entry.createdAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell>{entry.unitCount.toString()}</TableCell>
                        <TableCell>
                          {entry.currencyCode}$
                          {entry.unitValue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {entry.currencyCode}$
                          {entry.totalValue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogDescription>
            <CreateEntry assetId={asset.id} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
