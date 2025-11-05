-- Add created_by column to brands
ALTER TABLE brands
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Add created_by column to colors
ALTER TABLE colors
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Add created_by column to sizes
ALTER TABLE sizes
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Add created_by column to product_types
ALTER TABLE product_types
ADD COLUMN created_by UUID REFERENCES auth.users(id);
