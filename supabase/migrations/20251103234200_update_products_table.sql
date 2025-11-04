ALTER TABLE products DROP COLUMN product_type;
ALTER TABLE products ADD COLUMN product_type_id INTEGER REFERENCES product_types(id);
