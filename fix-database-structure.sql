-- =====================================================
-- DIAGNÓSTICO Y CORRECCIÓN DE BASE DE DATOS - KATE
-- =====================================================
-- Este archivo contiene los comandos SQL para diagnosticar y corregir
-- la estructura de la base de datos en Supabase

-- =====================================================
-- 1. DIAGNÓSTICO: Verificar estructura actual
-- =====================================================

-- Verificar estructura de la tabla customers
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- Verificar estructura de la tabla orders
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Verificar estructura de la tabla order_items
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- =====================================================
-- 2. CORRECCIÓN: Estructura de tabla CUSTOMERS
-- =====================================================

-- Crear tabla customers si no existe con la estructura correcta
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL UNIQUE,
    address TEXT,
    commune VARCHAR(100),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    last_order TIMESTAMP,
    join_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agregar columnas faltantes si la tabla ya existe
DO $$
BEGIN
    -- Agregar total_orders si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'total_orders') THEN
        ALTER TABLE customers ADD COLUMN total_orders INTEGER DEFAULT 0;
    END IF;
    
    -- Agregar total_spent si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'total_spent') THEN
        ALTER TABLE customers ADD COLUMN total_spent DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- Agregar last_order si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'last_order') THEN
        ALTER TABLE customers ADD COLUMN last_order TIMESTAMP;
    END IF;
    
    -- Agregar join_date si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'join_date') THEN
        ALTER TABLE customers ADD COLUMN join_date TIMESTAMP DEFAULT NOW();
    END IF;
    
    -- Agregar status si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'status') THEN
        ALTER TABLE customers ADD COLUMN status VARCHAR(50) DEFAULT 'Activo';
    END IF;
    
    -- Agregar created_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'created_at') THEN
        ALTER TABLE customers ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    END IF;
    
    -- Agregar updated_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'updated_at') THEN
        ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 3. CORRECCIÓN: Estructura de tabla ORDERS
-- =====================================================

-- Crear tabla orders si no existe con la estructura correcta
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    commune VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pendiente',
    total DECIMAL(10,2) NOT NULL,
    original_total DECIMAL(10,2),
    discount DECIMAL(10,2) DEFAULT 0.00,
    delivery_price DECIMAL(10,2) DEFAULT 0.00,
    coupon_code VARCHAR(50),
    estimated_delivery VARCHAR(100),
    date DATE DEFAULT CURRENT_DATE,
    time TIME DEFAULT CURRENT_TIME,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agregar columnas faltantes a orders si la tabla ya existe
DO $$
BEGIN
    -- Agregar delivery_price si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_price') THEN
        ALTER TABLE orders ADD COLUMN delivery_price DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- Agregar original_total si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'original_total') THEN
        ALTER TABLE orders ADD COLUMN original_total DECIMAL(10,2);
    END IF;
    
    -- Agregar discount si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount') THEN
        ALTER TABLE orders ADD COLUMN discount DECIMAL(10,2) DEFAULT 0.00;
    END IF;
END $$;

-- =====================================================
-- 4. CORRECCIÓN: Estructura de tabla ORDER_ITEMS
-- =====================================================

-- Crear tabla order_items si no existe
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50),
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(8,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price) STORED,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. TRIGGERS PARA ACTUALIZAR ESTADÍSTICAS DE CLIENTES
-- =====================================================

-- Función para actualizar estadísticas del cliente
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar estadísticas cuando se crea un nuevo pedido
    IF TG_OP = 'INSERT' THEN
        UPDATE customers 
        SET 
            total_orders = total_orders + 1,
            total_spent = total_spent + NEW.total,
            last_order = NOW(),
            updated_at = NOW()
        WHERE id = NEW.customer_id;
        
        RETURN NEW;
    END IF;
    
    -- Actualizar estadísticas cuando se actualiza un pedido
    IF TG_OP = 'UPDATE' THEN
        UPDATE customers 
        SET 
            total_spent = total_spent - OLD.total + NEW.total,
            updated_at = NOW()
        WHERE id = NEW.customer_id;
        
        RETURN NEW;
    END IF;
    
    -- Actualizar estadísticas cuando se elimina un pedido
    IF TG_OP = 'DELETE' THEN
        UPDATE customers 
        SET 
            total_orders = total_orders - 1,
            total_spent = total_spent - OLD.total,
            updated_at = NOW()
        WHERE id = OLD.customer_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar estadísticas automáticamente
DROP TRIGGER IF EXISTS trigger_update_customer_stats ON orders;
CREATE TRIGGER trigger_update_customer_stats
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- =====================================================
-- 6. FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS trigger_customers_updated_at ON customers;
CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

-- Índices en customers
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Índices en orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_orders_commune ON orders(commune);

-- Índices en order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- 8. POLÍTICAS RLS (Row Level Security) - OPCIONAL
-- =====================================================

-- Habilitar RLS si es necesario (descomenta si quieres usarlo)
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (ajusta según necesidades)
-- CREATE POLICY "Allow all operations" ON customers FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON orders FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON order_items FOR ALL USING (true);

-- =====================================================
-- 9. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'orders', 'order_items');

-- Verificar columnas de customers
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- Verificar columnas de orders
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Verificar columnas de order_items
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
-- 1. Copia este archivo completo
-- 2. Ve a tu proyecto en Supabase
-- 3. Ve a SQL Editor
-- 4. Pega el contenido y ejecuta sección por sección
-- 5. Primero ejecuta la sección 1 (DIAGNÓSTICO) para ver el estado actual
-- 6. Luego ejecuta las secciones 2-8 para aplicar las correcciones
-- 7. Finalmente ejecuta la sección 9 para verificar que todo esté correcto
-- =====================================================
