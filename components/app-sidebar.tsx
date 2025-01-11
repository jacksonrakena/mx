"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  AudioWaveform,
  BookOpen,
  CircleDollarSign,
  Command,
  Frame,
  GalleryVerticalEnd,
  Landmark,
  Map,
  PieChart,
  Settings2,
} from "lucide-react";
import { routeTable } from "./data";

// This is sample data.

const data = {
  user: {
    name: "Jackson Rakena",
    email: "jackson@rakena.com.au",
    avatar: "https://avatars.githubusercontent.com/u/44521335?v=4",
  },
  teams: [
    {
      name: "Rakena Whanau Trust",
      logo: GalleryVerticalEnd,
      plan: "Family trust",
      location: "New Zealand",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
      location: "",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
      location: "",
    },
  ],
  navMain: [
    {
      title: "Assets",
      url: "assets",
      icon: Landmark,
      isActive: true,
      items: [
        {
          title: "Securities",
          url: "securities",
        },
        {
          title: "Property",
          url: "property",
        },
        {
          title: "Cash and equivalents",
          url: "cash",
        },
        {
          title: "Credits",
          url: "credits",
        },
      ],
    },
    {
      title: "Liabilities",
      url: "liabilities",
      icon: CircleDollarSign,
      isActive: true,
      items: [
        {
          title: "Loans & mortgage",
          url: "loans",
        },
        {
          title: "Credit lines",
          url: "credit",
        },
        {
          title: "Other debts",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={routeTable} />
      </SidebarContent>
      <SidebarFooter>
        <TeamSwitcher teams={data.teams} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
