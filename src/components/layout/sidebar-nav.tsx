
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/sidebar";
import {
  SidebarMenuButton
} from "@/components/sidebar/SidebarMenu";
import {
  LayoutGrid,
  FolderKanban,
  Settings,
  LogOut,
  BookUser,
  Shield,
  Info,
  ListChecks,
  BarChart,
  ShoppingBag,
  BellRing,
  ClipboardList,
  Network
} from "lucide-react";
import { InstructionsDialog } from "./instructions-dialog";

const EcoFlowLogo = () => (
  <div className="flex items-center gap-2">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17L12 22L22 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12L12 17L22 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="font-semibold">NESTOR eco</span>
  </div>
);

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
        return pathname === path;
    }
    return pathname.startsWith(path) && path !== '/';
  };

  return (
    <>
      <SidebarHeader>
        <EcoFlowLogo />
      </SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive("/dashboard", true)}
            tooltip="Πίνακας Ελέγχου"
          >
            <Link href="/dashboard">
              <LayoutGrid />
              <span>Πίνακας Ελέγχου</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
           <SidebarMenuButton
            asChild
            isActive={isActive("/projects")}
            tooltip="Λίστα Έργων"
          >
            <Link href="/projects">
              <FolderKanban />
              <span>Λίστα Έργων</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
           <SidebarMenuButton
            asChild
            isActive={isActive("/project-interventions")}
            tooltip="Παρεμβάσεις Έργων"
          >
            <Link href="/project-interventions">
              <ClipboardList />
              <span>Παρεμβάσεις Έργων</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
           <SidebarMenuButton
            asChild
            isActive={isActive("/intervention-stages")}
            tooltip="Στάδια Παρεμβάσεων"
          >
            <Link href="/intervention-stages">
              <Network />
              <span>Στάδια Παρεμβάσεων</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive("/contacts")}
            tooltip="Λίστα Επαφών"
          >
            <Link href="/contacts">
              <BookUser />
              <span>Λίστα Επαφών</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive("/reports")}
            tooltip="Αναφορές"
          >
            <Link href="/reports">
              <BarChart />
              <span>Αναφορές</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive("/supplier-offers")}
            tooltip="Προσφορές Προμηθευτών"
          >
            <Link href="/supplier-offers">
              <ShoppingBag />
              <span>Προσφορές Προμηθευτών</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <InstructionsDialog>
            <SidebarMenuButton tooltip="Οδηγίες">
              <Info />
              <span>Οδηγίες</span>
            </SidebarMenuButton>
          </InstructionsDialog>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarFooter>
        <SidebarGroup>
           <SidebarGroupLabel>Διαχείριση</SidebarGroupLabel>
           <SidebarGroupContent>
              <SidebarMenu>
                 <SidebarMenuItem>
                     <SidebarMenuButton asChild isActive={isActive("/admin", true)} tooltip="Κατάλογος Παρεμβάσεων">
                        <Link href="/admin">
                            <Shield />
                            <span>Κατάλογος Παρεμβάσεων</span>
                        </Link>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                     <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/custom-lists")} tooltip="Προσαρμοσμένες Λίστες">
                        <Link href="/admin/custom-lists">
                            <ListChecks />
                            <span>Προσαρμοσμένες Λίστες</span>
                        </Link>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                     <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/triggers")} tooltip="Triggers">
                        <Link href="/admin/triggers">
                            <BellRing />
                            <span>Triggers</span>
                        </Link>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                     <SidebarMenuButton asChild isActive={isActive("/settings")} tooltip="Ρυθμίσεις">
                        <Link href="/settings">
                            <Settings />
                            <span>Ρυθμίσεις</span>
                        </Link>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                     <SidebarMenuButton tooltip="Αποσύνδεση">
                        <LogOut />
                        <span>Αποσύνδεση</span>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
           </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </>
  );
}
