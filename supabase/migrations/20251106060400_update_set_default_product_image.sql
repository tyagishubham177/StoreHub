-- Ensure the set_default_product_image RPC only toggles the intended record
CREATE OR REPLACE FUNCTION public.set_default_product_image(
  p_product_id uuid,
  p_image_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- First, unset any existing default flag for the product
  UPDATE public.product_images
  SET is_default = false
  WHERE product_id = p_product_id;

  -- Then, set the requested image as the default, ensuring it belongs to the product
  UPDATE public.product_images
  SET is_default = true
  WHERE id = p_image_id
    AND product_id = p_product_id;

  -- Raise an explicit error when no image matches the provided identifiers
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product image % is not associated with product %', p_image_id, p_product_id
      USING ERRCODE = 'P0002';
  END IF;
END;
$$;
