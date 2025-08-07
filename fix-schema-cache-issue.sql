-- SCRIPT PARA SOLUCIONAR PROBLEMA DE SCHEMA CACHE EN SUPABASE
-- Ejecutar paso a paso en Supabase SQL Editor

-- PASO 1: Verificar si las tablas realmente existen y tienen las columnas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('products', 'categories')
ORDER BY table_name, ordinal_position;

-- PASO 2: Verificar el esquema actual de products específicamente
\d products;

-- PASO 3: Si la tabla no existe o está mal, recrearla completamente
-- SOLO EJECUTAR SI LA TABLA NO EXISTE O TIENE PROBLEMAS

-- Eliminar tabla si existe (CUIDADO: esto borra todos los datos)
-- DROP TABLE IF EXISTS products CASCADE;

-- Recrear tabla products con estructura correcta
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  stock INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 4: Si la tabla existe pero falta category_id, agregarla
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- PASO 5: Agregar is_visible si no existe
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- PASO 6: Actualizar registros existentes
UPDATE products SET is_visible = true WHERE is_visible IS NULL;
UPDATE categories SET is_visible = true WHERE is_visible IS NULL;

-- PASO 7: Crear triggers si no existen
CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- PASO 8: Configurar RLS permisivo para desarrollo
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow all operations on products" ON products;
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;

-- Crear políticas permisivas
CREATE POLICY "Allow all operations on products" 
ON products FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on categories" 
ON categories FOR ALL 
USING (true) WITH CHECK (true);

-- PASO 9: Verificar que todo está correcto
SELECT 
    'products' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 10: Probar insert para verificar que funciona
-- INSERT INTO products (name, description, price, category_id, image, stock) 
-- VALUES ('Test Product', 'Test Description', 100.00, 
--         (SELECT id FROM categories LIMIT 1), 'test.jpg', 10);

-- PASO 11: Limpiar test si se ejecutó
-- DELETE FROM products WHERE name = 'Test Product';
