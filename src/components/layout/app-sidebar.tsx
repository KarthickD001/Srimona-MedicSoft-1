
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Bell,
  Home,
  LineChart,
  Package,
  Pill,
  ShoppingCart,
  Users,
  Cog,
} from 'lucide-react';

const navLinks = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/billing', icon: ShoppingCart, label: 'Billing' },
  { href: '/inventory', icon: Package, label: 'Inventory' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/reports', icon: LineChart, label: 'Reports' },
];

const bottomLinks = [{ href: '/settings', icon: Cog, label: 'Settings' }];

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <Sidebar collapsible="icon">
        <SidebarHeader>
             <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Pill className="h-5 w-5" />
                </div>
                <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Srimona</span>
            </div>
        </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href} className="flex">
                <SidebarMenuButton isActive={isActive(link.href)} tooltip={link.label}>
                  <link.icon />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {bottomLinks.map((link) => (
             <SidebarMenuItem key={link.href}>
              <Link href={link.href} className="flex">
                <SidebarMenuButton isActive={isActive(link.href)} tooltip={link.label}>
                  <link.icon />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
