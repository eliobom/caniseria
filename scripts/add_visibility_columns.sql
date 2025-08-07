-- Migration script to add is_visible columns to categories and products tables
-- Run this script in your Supabase SQL editor or psql

-- Add is_visible column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Add is_visible column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Update existing records to be visible by default
UPDATE categories SET is_visible = true WHERE is_visible IS NULL;
UPDATE products SET is_visible = true WHERE is_visible IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN categories.is_visible IS 'Controls whether the category is visible in the frontend';
COMMENT ON COLUMN products.is_visible IS 'Controls whether the product is visible in the frontend';