import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';

interface LabLayoutProps {
  children: ReactNode;
}

export function LabLayout({ children }: LabLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <Header />

        <div className="flex flex-1 mt-20">
          <AppSidebar />

          <main
            id="main-content"
            className="flex-1 min-w-0 overflow-auto lab-content"
          >
            <div className="sticky top-0 z-10 flex items-center h-10 px-2 border-b border-border/40 bg-background/80 backdrop-blur-sm">
              <SidebarTrigger className="h-8 w-8" />
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
