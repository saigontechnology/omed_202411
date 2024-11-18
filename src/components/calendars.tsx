import * as React from "react";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { DatePickerWithRange } from "./date-range-picker";
import { useFilterContext } from "./filter-context";

export function Calendars({
  calendars,
}: {
  calendars: {
    name: string;
    key: string; // Use 'key' instead of 'name'
    items: string[];
    type?: string;
  }[];
}) {
  const { filters, setFilter } = useFilterContext();

  const renderFilter = (calendar: {
    name: string;
    key: string; // Use 'key' instead of 'name'
    items: string[];
    type?: string;
  }) => {
    return calendar.items.map((item) => (
      <div key={item}>
        {calendar.type === "date-picker" ? (
          <div>
            <DatePickerWithRange
              defaultRange={filters[calendar.key] || {}} // Use 'calendar.key'
              onRangeChange={(range) => setFilter(calendar.key, range)} // Update context using 'calendar.key'
            />
          </div>
        ) : (
          <div
            onClick={() => setFilter(calendar.key, item)} // Update context using 'calendar.key'
            className={`p-1 border rounded-lg cursor-pointer px-3 font-medium transition-colors duration-300 ${
              filters[calendar.key] === item
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            {item}
          </div>
        )}
      </div>
    ));
  };

  return (
    <>
      {calendars.map((calendar) => (
        <React.Fragment key={calendar.key}>
          <SidebarGroup key={calendar.key} className="py-0">
            <Collapsible defaultOpen={true} className="group/collapsible">
              <SidebarGroupLabel
                asChild
                className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger className="font-bold text-[14px]">
                  {calendar.name}{" "}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="flex px-2 mt-2">
                    {renderFilter(calendar)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
          <SidebarSeparator className="mx-0" />
        </React.Fragment>
      ))}
    </>
  );
}
