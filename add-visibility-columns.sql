-- SCRIPT PARA AGREGAR COLUMNAS DE VISIBILIDAD
-- Ejecutar en Supabase SQL Editor paso a paso

-- 1. Verificar estructura actual de las tablas
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name IN ('categories', 'products')
ORDER BY table_name, ordinal_position;

-- 2. Agregar columna is_visible a la tabla categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 3. Agregar columna is_visible a la tabla products  
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 4. Actualizar registros existentes para que sean visibles por defecto
UPDATE categories SET is_visible = true WHERE is_visible IS NULL;
UPDATE products SET is_visible = true WHERE is_visible IS NULL;

-- 5. Verificar que las columnas se agregaron correctamente
SELECT table_name, column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name IN ('categories', 'products') AND column_name = 'is_visible';

-- 6. Verificar algunos registros de ejemplo
SELECT id, name, is_visible FROM categories LIMIT 5;
SELECT id, name, is_visible FROM products LIMIT 5;

-- 7. Si hay problemas con RLS, ejecutar estos comandos:
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 8. Crear políticas permisivas para desarrollo (SOLO PARA DESARROLLO)
-- DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;
-- DROP POLICY IF EXISTS "Allow all operations on products" ON products;
-- CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true) WITH CHECK (true);
