"use client";

import * as React from "react";

import { updateHomeCurrency } from "@/app/actions";
import { useAppSession } from "@/app/providers/AppSessionProvider";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Currency } from "@prisma/client";
import { routeTable } from "./data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = useAppSession();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={routeTable} />
        <div className="mx-4">
          <Select
            value={session.user?.homeCurrency}
            onValueChange={(e) => {
              (async () => {
                await updateHomeCurrency(e as Currency);
              })();
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Currency).map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="m-2 flex gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">mxbudget</span>
              <span>
                <span className="truncate text-xs">Internal</span>
              </span>
            </div>
            {/*  */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
