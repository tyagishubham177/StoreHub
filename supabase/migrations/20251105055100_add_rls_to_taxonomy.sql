-- Brands RLS policies
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access on brands"
ON brands
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow users to create brands"
ON brands
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to view all brands"
ON brands
FOR SELECT
USING (true);

CREATE POLICY "Allow users to update their own brands"
ON brands
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to delete their own brands"
ON brands
FOR DELETE
USING (auth.uid() = created_by);

-- Colors RLS policies
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access on colors"
ON colors
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow users to create colors"
ON colors
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to view all colors"
ON colors
FOR SELECT
USING (true);

CREATE POLICY "Allow users to update their own colors"
ON colors
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to delete their own colors"
ON colors
FOR DELETE
USING (auth.uid() = created_by);

-- Sizes RLS policies
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access on sizes"
ON sizes
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow users to create sizes"
ON sizes
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to view all sizes"
ON sizes
FOR SELECT
USING (true);

CREATE POLICY "Allow users to update their own sizes"
ON sizes
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to delete their own sizes"
ON sizes
FOR DELETE
USING (auth.uid() = created_by);

-- Product Types RLS policies
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access on product_types"
ON product_types
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow users to create product_types"
ON product_types
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to view all product_types"
ON product_types
FOR SELECT
USING (true);

CREATE POLICY "Allow users to update their own product_types"
ON product_types
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to delete their own product_types"
ON product_types
FOR DELETE
USING (auth.uid() = created_by);
