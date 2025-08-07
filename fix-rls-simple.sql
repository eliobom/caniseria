-- SOLUCIÓN RÁPIDA PARA RLS - Ejecutar en Supabase SQL Editor
-- Esta es una solución temporal para desarrollo

-- Opción 1: Deshabilitar RLS temporalmente (MÁS FÁCIL)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Opción 2: Si prefieres mantener RLS habilitado, usa estas políticas permisivas
-- (Comenta las líneas de arriba y descomenta las de abajo)

-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- -- Eliminar políticas existentes si las hay
-- DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
-- DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;
-- DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON categories;

-- -- Crear políticas permisivas para todas las operaciones
-- CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true);

-- Verificar que las tablas existen y tienen las columnas correctas
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('categories', 'products', 'customers', 'orders', 'order_items')
ORDER BY table_name, ordinal_position;
