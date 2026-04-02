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
        <Header />

        <div className="flex flex-1 mt-20">
          <AppSidebar />

          <main
            id="main-content"
            className="flex-1 min-w-0 overflow-auto lab-content"
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
