import { Header } from '@/components/layout/header';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import type { Metadata } from 'next';
import { SettingsProvider } from '@/context/settings-context';

export const metadata: Metadata = {
  title: 'Srimona MedSoft Dashboard',
  description: 'Manage your pharmacy with ease.',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <SidebarProvider>
          <div className="flex min-h-screen w-full flex-col bg-muted/40">
              <AppSidebar />
              <SidebarInset>
                  <Header />
                  <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                      {children}
                  </main>
              </SidebarInset>
          </div>
      </SidebarProvider>
    </SettingsProvider>
  );
}
