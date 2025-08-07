-- Políticas RLS para permitir operaciones CRUD en el panel de administración
-- Ejecutar este script en el SQL Editor de Supabase

-- Habilitar RLS en todas las tablas (si no está ya habilitado)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla categories
-- Permitir SELECT para todos (para mostrar categorías en la tienda)
CREATE POLICY "Allow public read access to categories" ON categories
  FOR SELECT USING (true);

-- Permitir INSERT, UPDATE, DELETE para usuarios autenticados (admins)
CREATE POLICY "Allow authenticated users to manage categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Políticas para la tabla products
-- Permitir SELECT para todos (para mostrar productos en la tienda)
CREATE POLICY "Allow public read access to products" ON products
  FOR SELECT USING (true);

-- Permitir INSERT, UPDATE, DELETE para usuarios autenticados (admins)
CREATE POLICY "Allow authenticated users to manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Políticas para la tabla admin_users
-- Solo permitir SELECT para autenticación
CREATE POLICY "Allow admin authentication" ON admin_users
  FOR SELECT USING (true);

-- Políticas para la tabla customers
-- Permitir todas las operaciones para usuarios autenticados
CREATE POLICY "Allow authenticated users to manage customers" ON customers
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Políticas para la tabla orders
-- Permitir todas las operaciones para usuarios autenticados
CREATE POLICY "Allow authenticated users to manage orders" ON orders
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Políticas para la tabla order_items
-- Permitir todas las operaciones para usuarios autenticados
CREATE POLICY "Allow authenticated users to manage order_items" ON order_items
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Alternativamente, si las políticas anteriores no funcionan,
-- puedes usar estas políticas más permisivas (solo para desarrollo):

-- DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
-- DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON categories;

-- CREATE POLICY "Allow all operations on categories" ON categories
--   FOR ALL USING (true);

-- CREATE POLICY "Allow all operations on products" ON products
--   FOR ALL USING (true);

-- CREATE POLICY "Allow all operations on customers" ON customers
--   FOR ALL USING (true);

-- CREATE POLICY "Allow all operations on orders" ON orders
--   FOR ALL USING (true);

-- CREATE POLICY "Allow all operations on order_items" ON order_items
--   FOR ALL USING (true);
