import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import type { ReactElement } from "react";
import React from "react";

export default function BreadcrumbSlot({
  params,
}: {
  params: { all: string[] };
}) {
  const breadcrumbItems: ReactElement[] = [];
  let breadcrumbPage: ReactElement = <></>;
  for (let i = 0; i < params.all.length; i++) {
    const route = params.all[i];
    const href = `/${params.all.at(0)}/${route}`;
    if (i === params.all.length - 1) {
      breadcrumbPage = (
        <BreadcrumbItem>
          <BreadcrumbPage className="capitalize">{route}</BreadcrumbPage>
        </BreadcrumbItem>
      );
    } else {
      breadcrumbItems.push(
        <React.Fragment key={href}>
          <BreadcrumbItem>
            <BreadcrumbLink asChild className="capitalize">
              <Link href={href}>{route}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </React.Fragment>
      );
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.length !== 0 && (
          <>
            {breadcrumbItems}
            <BreadcrumbSeparator />
          </>
        )}
        {breadcrumbPage}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
