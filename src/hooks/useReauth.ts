import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseReauthOptions {
  title?: string;
  description?: string;
  actionLabel?: string;
  destructive?: boolean;
}

/**
 * Hook for managing re-authentication flow for sensitive admin actions.
 * Returns dialog state and a function to trigger the re-auth flow.
 */
export function useReauth(options: UseReauthOptions = {}) {
  const { hasRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const isAdmin = hasRole('admin');

  /**
   * Wraps an action that requires re-authentication.
   * If user is admin, shows re-auth dialog before executing.
   * If user is not admin (e.g., moderator), executes immediately.
   */
  const requireReauth = useCallback((action: () => void) => {
    if (isAdmin) {
      setPendingAction(() => action);
      setIsOpen(true);
    } else {
      // Non-admin privileged users (moderators) execute immediately
      action();
    }
  }, [isAdmin]);

  const handleConfirm = useCallback(() => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setPendingAction(null);
    }
  }, []);

  return {
    isOpen,
    setIsOpen: handleOpenChange,
    requireReauth,
    onConfirm: handleConfirm,
    dialogProps: {
      open: isOpen,
      onOpenChange: handleOpenChange,
      onConfirm: handleConfirm,
      ...options,
    },
  };
}
