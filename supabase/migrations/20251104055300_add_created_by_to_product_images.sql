
-- add_created_by_to_product_images.sql
ALTER TABLE public.product_images
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Allow authenticated users to see all images
DROP POLICY IF EXISTS "Authenticated users can see their own images" ON public.product_images;
CREATE POLICY "Authenticated users can see all images"
ON public.product_images
FOR SELECT
USING (
  auth.role() = 'authenticated'
);

-- Allow authenticated users to add images
DROP POLICY IF EXISTS "Authenticated users can add images" ON public.product_images;
CREATE POLICY "Authenticated users can add images"
ON public.product_images
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
);
