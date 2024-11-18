import * as React from "react";

import { Calendars } from "@/components/calendars";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "Admin",
    email: "admin@domain.com",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
  },
  calendars: [
    {
      name: "Type",
      key: "type",
      items: ["Full", "Favorites"],
    },
    {
      name: "Exchange",
      key: "exchange",
      items: ["OKX", "Binance"],
    },
    {
      name: "Date Range",
      type: "date-picker",
      key: "date",
      items: ["Date Range"],
    },
    {
      name: "Time",
      key: "time",
      items: ["1D", "7D"],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <img
          src="https://saigontechnology.com/wp-content/uploads/2024/09/logo-black-1.svg"
          alt=""
          className="px-6"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarSeparator className="mx-0" />
        <Calendars calendars={data.calendars} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
