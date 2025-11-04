
-- add_created_by_to_product_images.sql
ALTER TABLE public.product_images
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Allow authenticated users to see their own images
DROP POLICY IF EXISTS "Authenticated users can see their own images" ON public.product_images;
CREATE POLICY "Authenticated users can see their own images"
ON public.product_images
FOR SELECT
USING (
  auth.uid() = created_by
);

-- Allow authenticated users to add images
DROP POLICY IF EXISTS "Authenticated users can add images" ON public.product_images;
CREATE POLICY "Authenticated users can add images"
ON public.product_images
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
);
