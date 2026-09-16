CREATE TABLE public.catalog_audit_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  artist_name text,
  catalog_size text,
  catalog_link text,
  ownership_status text,
  splits_documented text,
  pro_affiliation text,
  goals text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'new',
  payment_status text NOT NULL DEFAULT 'unpaid',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.catalog_audit_submissions TO authenticated;
GRANT ALL ON public.catalog_audit_submissions TO service_role;

ALTER TABLE public.catalog_audit_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view catalog audit submissions"
ON public.catalog_audit_submissions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update catalog audit submissions"
ON public.catalog_audit_submissions FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete catalog audit submissions"
ON public.catalog_audit_submissions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_catalog_audit_submissions_updated_at
BEFORE UPDATE ON public.catalog_audit_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();