"use client";

import * as React from "react";
import {
  Speedometer,
  Folder,
  Users,
  ChartBar,
  Gear,
  Question,
  MagnifyingGlass,
  Plus,
  ShieldCheck,
  SquaresFour,
  Layout,
} from "@phosphor-icons/react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar";
import { useRouter } from "@tanstack/react-router";

export function AppSidebar({
  user,
  workspaces = [],
  currentWorkspace = null,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    agent?: boolean;
    superAdmin?: boolean;
    image?: string | null;
  } | null;
  workspaces?: any[];
  currentWorkspace?: any;
}) {
  const router = useRouter();

  const handleWorkspaceSwitch = async (workspaceId: string) => {
    try {
      const response = await fetch("/api/workspace/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error("Failed to switch workspace");
      }
    } catch (error) {
      console.error("Error switching workspace:", error);
    }
  };

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Speedometer,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: Folder,
    },
    {
      title: "Template",
      url: "/dashboard/template",
      icon: Layout,
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: Users,
    },
  ];

  const navSecondary = [
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: ChartBar,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Gear,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: Question,
    },
    {
      title: "Search",
      url: "#",
      icon: MagnifyingGlass,
    },
  ];

  if (user?.superAdmin) {
    navSecondary.unshift({
      title: "Control room",
      url: "/control-room",
      icon: ShieldCheck,
    });
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                {/* pengganti IconInnerShadowTop */}
                <SquaresFour className="!size-5" />
                <span className="text-base font-semibold">
                  {currentWorkspace?.name || "Genia"}
                </span>
              </a>
            </SidebarMenuButton>

            {workspaces.length > 1 && (
              <SidebarMenuAction
                onClick={() => router.push("/dashboard/workspaces")}
              >
                <Plus className="h-4 w-4" />
              </SidebarMenuAction>
            )}
          </SidebarMenuItem>

          {workspaces.length > 1 && (
            <SidebarMenuSub>
              {workspaces.map((workspace) => (
                <SidebarMenuSubItem key={workspace.id}>
                  <SidebarMenuSubButton
                    onClick={() => handleWorkspaceSwitch(workspace.id)}
                    isActive={currentWorkspace?.id === workspace.id}
                  >
                    <span>{workspace.name}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
