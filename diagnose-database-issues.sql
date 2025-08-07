-- SCRIPT DE DIAGNÓSTICO PARA PROBLEMAS DE BASE DE DATOS
-- Ejecutar en Supabase SQL Editor para diagnosticar los problemas

-- 1. VERIFICAR SI LAS TABLAS EXISTEN
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename IN ('categories', 'products', 'admin_users')
ORDER BY tablename;

-- 2. VERIFICAR ESTRUCTURA COMPLETA DE LA TABLA PRODUCTS
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 3. VERIFICAR ESTRUCTURA COMPLETA DE LA TABLA CATEGORIES
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'categories'
ORDER BY ordinal_position;

-- 4. VERIFICAR SI HAY DATOS EN LAS TABLAS
SELECT 'categories' as table_name, COUNT(*) as record_count FROM categories
UNION ALL
SELECT 'products' as table_name, COUNT(*) as record_count FROM products;

-- 5. VERIFICAR FOREIGN KEYS Y CONSTRAINTS
SELECT
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name IN ('products', 'categories');

-- 6. VERIFICAR ROW LEVEL SECURITY (RLS)
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename IN ('categories', 'products');

-- 7. VERIFICAR POLÍTICAS DE RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('categories', 'products');

-- 8. PROBAR INSERT SIMPLE EN CATEGORIES (para diagnosticar RLS)
-- DESCOMENTA SOLO SI QUIERES PROBAR:
-- INSERT INTO categories (name, description, image, "order") 
-- VALUES ('Test Category', 'Test Description', 'test.jpg', 1);

-- 9. PROBAR INSERT SIMPLE EN PRODUCTS (para diagnosticar RLS)
-- DESCOMENTA SOLO SI QUIERES PROBAR:
-- INSERT INTO products (name, description, price, category_id, image, stock) 
-- VALUES ('Test Product', 'Test Description', 100.00, 
--         (SELECT id FROM categories LIMIT 1), 'test.jpg', 10);
