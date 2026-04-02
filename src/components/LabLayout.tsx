import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';

interface LabLayoutProps {
  children: ReactNode;
}

export function LabLayout({ children }: LabLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        {/* Same header as public pages - fixed, z-50 */}
        <Header />

        {/* Below the fixed header */}
        <div className="flex flex-1 mt-20">
          <AppSidebar />

          {/* White content area */}
          <main
            id="main-content"
            className="flex-1 min-w-0 bg-white dark:bg-background overflow-auto"
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
