"use client";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { useMemo } from "react";
import { RouteData } from "./data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

export const BreadcrumbRouteComponent = ({
  title,
  route,
  isLast,
}: {
  title: string;
  route: string;
  isLast: boolean;
}) => {
  return (
    <>
      <BreadcrumbItem className={!isLast ? "hidden md:block" : ""}>
        {isLast ? (
          <BreadcrumbPage>{title}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink asChild>
            <Link href={route}>{title}</Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
      {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
    </>
  );
};

export const ClientBreadcrumbs = ({
  routeTable,
}: {
  routeTable: RouteData;
}) => {
  const routes = useSelectedLayoutSegments();
  const finalSegments = useMemo(
    () =>
      routes.map((segment, idx) => {
        const isLast = routes.length - 1 === idx;
        const precedingSegments = routes.slice(0, idx + 1);
        let start = { title: "Home", url: "", items: routeTable };
        for (const segment of precedingSegments) {
          const candidate = start.items.find(
            (t) => t.url.toLowerCase() === segment
          );
          if (!candidate)
            return (
              <BreadcrumbRouteComponent
                key={idx}
                title={segment}
                route={segment}
                isLast={isLast}
              />
            );
          start = candidate;
        }

        return (
          <BreadcrumbRouteComponent
            key={idx}
            title={start.title}
            route={"/" + precedingSegments.join("/")}
            isLast={routes.length - 1 === idx}
          />
        );
      }),
    [routeTable, routes]
  );
  return (
    <Breadcrumb>
      <BreadcrumbList>{finalSegments}</BreadcrumbList>
    </Breadcrumb>
  );
};
