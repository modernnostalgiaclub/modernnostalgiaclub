import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuditLogOptions {
  tableName: string;
  action: string;
  recordId?: string;
  details?: Record<string, unknown>;
}

export function useAuditLog() {
  const logAccess = useCallback(async (options: AuditLogOptions) => {
    const { tableName, action, recordId, details } = options;

    try {
      const { error } = await supabase.rpc('log_admin_access', {
        _table_name: tableName,
        _action: action,
        _record_id: recordId || null,
        _details: details ? JSON.stringify(details) : null,
      });

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (err) {
      console.error('Audit logging error:', err);
    }
  }, []);

  return { logAccess };
}
