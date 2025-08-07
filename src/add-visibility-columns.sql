-- Add is_visible column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Add is_visible column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Update existing records to have is_visible = true by default
UPDATE categories 
SET is_visible = true 
WHERE is_visible IS NULL;

UPDATE products 
SET is_visible = true 
WHERE is_visible IS NULL;
