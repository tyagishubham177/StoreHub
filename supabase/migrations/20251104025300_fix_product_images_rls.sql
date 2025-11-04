-- Drop the overly restrictive default policy
DROP POLICY IF EXISTS "Admin writes when enabled" ON public.product_images;

-- Drop the policy if it exists, to ensure this migration is re-runnable
DROP POLICY IF EXISTS "Admin insert product_images" ON public.product_images;

-- Re-create a more targeted INSERT policy that is not blocked by a read-only mode
CREATE POLICY "Admin insert product_images"
  ON public.product_images
  FOR INSERT
  WITH CHECK (public.is_admin());
