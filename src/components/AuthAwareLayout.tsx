import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LabLayout } from '@/components/LabLayout';

interface AuthAwareLayoutProps {
  children: ReactNode;
}

export function AuthAwareLayout({ children }: AuthAwareLayoutProps) {
  const { user, loading } = useAuth();

  // While loading, render without layout to avoid flash
  if (loading) {
    return <>{children}</>;
  }

  // If signed in, wrap in LabLayout (sidebar + header)
  if (user) {
    return <LabLayout>{children}</LabLayout>;
  }

  // If signed out, render children directly (page handles its own header/footer)
  return <>{children}</>;
}
