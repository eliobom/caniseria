-- SOLUCIÓN SIMPLE PARA EL ERROR DE ID
-- Ejecutar en Supabase SQL Editor

-- Habilitar la extensión uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar la columna id con valor por defecto
ALTER TABLE categories ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Si la tabla no tiene la columna id correctamente configurada, recrearla:
-- (Solo ejecutar esto si la tabla está vacía o puedes perder datos)
-- DROP TABLE IF EXISTS categories;
-- CREATE TABLE categories (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   name TEXT NOT NULL,
--   description TEXT,
--   image TEXT,
--   "order" INTEGER DEFAULT 0,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Verificar la configuración
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'categories' AND column_name = 'id';
