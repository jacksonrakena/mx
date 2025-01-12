import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assets & liabilities",
};

export default async function AssetsLayout({
  children,
}: React.PropsWithChildren<{}>) {
  return <>{children}</>;
}
