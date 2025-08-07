-- SOLUCIÓN PARA EL ERROR DE COLUMNA ID
-- Ejecutar en Supabase SQL Editor

-- Primero, habilitar la extensión uuid-ossp si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar la estructura actual de la tabla categories
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- Opción 1: Si la columna id existe pero no tiene default, agregar el default
ALTER TABLE categories ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Opción 2: Si la tabla no existe, crearla completamente
-- (Descomenta las líneas de abajo si la tabla no existe)

-- CREATE TABLE IF NOT EXISTS categories (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   name TEXT NOT NULL,
--   description TEXT,
--   image TEXT,
--   "order" INTEGER DEFAULT 0,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Crear función para insertar categorías con ID automático
CREATE OR REPLACE FUNCTION insert_category(
  category_name TEXT,
  category_description TEXT DEFAULT '',
  category_image TEXT DEFAULT '',
  category_order INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  image TEXT,
  "order" INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO categories (name, description, image, "order")
  VALUES (category_name, category_description, category_image, category_order)
  RETURNING categories.id, categories.name, categories.description, categories.image, categories."order", categories.created_at, categories.updated_at;
END;
$$;

-- Verificar que el cambio se aplicó correctamente
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;
