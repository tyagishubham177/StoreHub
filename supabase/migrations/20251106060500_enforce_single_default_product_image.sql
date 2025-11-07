-- Clear any duplicate defaults so the unique index can be created safely
WITH ranked_defaults AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY product_id
      ORDER BY created_at DESC, id DESC
    ) AS rn
  FROM public.product_images
  WHERE is_default
)
UPDATE public.product_images pi
SET is_default = false
WHERE pi.id IN (
  SELECT id
  FROM ranked_defaults
  WHERE rn > 1
);

-- Ensure re-runnable by dropping the index if it already exists
DROP INDEX IF EXISTS product_images_one_default_per_product;

-- Enforce only one default image per product
CREATE UNIQUE INDEX product_images_one_default_per_product
  ON public.product_images (product_id)
  WHERE (is_default);
