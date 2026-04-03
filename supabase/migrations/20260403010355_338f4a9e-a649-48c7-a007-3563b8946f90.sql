
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;

CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );
