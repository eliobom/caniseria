-- Agregar las columnas faltantes a la tabla orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS original_total DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery TEXT DEFAULT '45-60 minutos';

-- Agregar la columna faltante a la tabla analytics
ALTER TABLE analytics 
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;