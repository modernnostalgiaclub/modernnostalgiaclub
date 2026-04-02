import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface AuthAwareLayoutProps {
  children: ReactNode;
}

export function AuthAwareLayout({ children }: AuthAwareLayoutProps) {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return <>{children}</>;
  }

  // Signed in: show sidebar alongside the page content (page keeps its own header)
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
