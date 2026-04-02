INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Blog images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'blog-images');