-- Update log_admin_access function to capture and mask IP address (first 3 octets only)
CREATE OR REPLACE FUNCTION public.log_admin_access(
  _table_name text, 
  _action text, 
  _record_id uuid DEFAULT NULL::uuid, 
  _details jsonb DEFAULT NULL::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  log_id uuid;
  raw_ip text;
  masked_ip text;
BEGIN
  -- Only log if user is admin or moderator
  IF has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator') THEN
    -- Get client IP and mask last octet for privacy
    raw_ip := inet_client_addr()::text;
    
    -- Mask IPv4: replace last octet with 0 (e.g., 192.168.1.123 -> 192.168.1.0)
    -- Mask IPv6: truncate to first 3 groups
    IF raw_ip IS NOT NULL THEN
      IF raw_ip LIKE '%:%' THEN
        -- IPv6: keep first 3 groups, mask the rest
        masked_ip := regexp_replace(raw_ip, '(([0-9a-fA-F]*:){3}).*', '\1::/48');
      ELSE
        -- IPv4: replace last octet with 0
        masked_ip := regexp_replace(raw_ip, '\.\d+(/\d+)?$', '.0');
      END IF;
    END IF;
    
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, details, ip_address)
    VALUES (auth.uid(), _action, _table_name, _record_id, _details, masked_ip)
    RETURNING id INTO log_id;
    
    RETURN log_id;
  END IF;
  
  RETURN NULL;
END;
$function$;