-- SOLUCIÓN ALTERNATIVA PARA PROBLEMA DE SCHEMA CACHE
-- Este script recrea completamente las tablas para evitar problemas de caché

-- PASO 1: Hacer backup de datos existentes (si los hay)
CREATE TABLE IF NOT EXISTS categories_backup AS SELECT * FROM categories;
CREATE TABLE IF NOT EXISTS products_backup AS SELECT * FROM products;

-- PASO 2: Eliminar tablas problemáticas (esto forzará a Supabase a refrescar el esquema)
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- PASO 3: Recrear tabla categories desde cero
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  "order" INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 4: Recrear tabla products desde cero con todas las columnas necesarias
CREATE TABLE products (
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

-- PASO 5: Restaurar datos desde backup (si existían)
INSERT INTO categories (id, name, description, image, "order", created_at, updated_at)
SELECT id, name, description, image, "order", created_at, updated_at 
FROM categories_backup
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, category_id, name, description, price, image, stock, created_at, updated_at)
SELECT id, category_id, name, description, price, image, stock, created_at, updated_at 
FROM products_backup
ON CONFLICT (id) DO NOTHING;

-- PASO 6: Actualizar is_visible para registros restaurados
UPDATE categories SET is_visible = true WHERE is_visible IS NULL;
UPDATE products SET is_visible = true WHERE is_visible IS NULL;

-- PASO 7: Recrear función y triggers
CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- PASO 8: Configurar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo
CREATE POLICY "Allow all operations on categories" 
ON categories FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on products" 
ON products FOR ALL 
USING (true) WITH CHECK (true);

-- PASO 9: Limpiar tablas de backup
DROP TABLE IF EXISTS categories_backup;
DROP TABLE IF EXISTS products_backup;

-- PASO 10: Verificar estructura final
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('categories', 'products') 
ORDER BY table_name, ordinal_position;

-- PASO 11: Insertar categoría de prueba
INSERT INTO categories (name, description, image, "order") 
VALUES ('Categoría de Prueba', 'Descripción de prueba', 'https://via.placeholder.com/300', 1);

-- PASO 12: Insertar producto de prueba
INSERT INTO products (name, description, price, category_id, image, stock) 
VALUES ('Producto de Prueba', 'Descripción de prueba', 100.00, 
        (SELECT id FROM categories WHERE name = 'Categoría de Prueba'), 
        'https://via.placeholder.com/300', 10);

-- PASO 13: Verificar que los datos se insertaron correctamente
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'products' as table_name, COUNT(*) as count FROM products;
