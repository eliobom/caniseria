-- =====================================================
-- SISTEMA DE CUPONES - TABLA Y FUNCIONES
-- =====================================================
-- Este archivo crea la estructura completa para el sistema de cupones

-- =====================================================
-- 1. CREAR TABLA DE CUPONES
-- =====================================================

CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. CREAR TABLA DE USO DE CUPONES
-- =====================================================

CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(coupon_id, order_id)
);

-- =====================================================
-- 3. FUNCIÓN PARA VALIDAR CUPONES
-- =====================================================

CREATE OR REPLACE FUNCTION validate_coupon(
    coupon_code VARCHAR(50),
    order_total DECIMAL(10,2)
)
RETURNS TABLE(
    is_valid BOOLEAN,
    coupon_id UUID,
    discount_amount DECIMAL(10,2),
    error_message TEXT
) AS $$
DECLARE
    coupon_record RECORD;
    calculated_discount DECIMAL(10,2);
BEGIN
    -- Buscar el cupón
    SELECT * INTO coupon_record
    FROM coupons 
    WHERE code = coupon_code AND is_active = true;
    
    -- Verificar si el cupón existe
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL(10,2), 'Cupón no válido o no existe'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si el cupón está activo
    IF NOT coupon_record.is_active THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL(10,2), 'Cupón desactivado'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar fechas de validez
    IF coupon_record.start_date > NOW() THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL(10,2), 'Cupón aún no está disponible'::TEXT;
        RETURN;
    END IF;
    
    IF coupon_record.end_date IS NOT NULL AND coupon_record.end_date < NOW() THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL(10,2), 'Cupón expirado'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar monto mínimo del pedido
    IF order_total < coupon_record.min_order_amount THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL(10,2), 
            format('Monto mínimo requerido: $%s', coupon_record.min_order_amount)::TEXT;
        RETURN;
    END IF;
    
    -- Verificar límite de uso
    IF coupon_record.usage_limit IS NOT NULL AND coupon_record.used_count >= coupon_record.usage_limit THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL(10,2), 'Cupón agotado'::TEXT;
        RETURN;
    END IF;
    
    -- Calcular descuento
    IF coupon_record.type = 'percentage' THEN
        calculated_discount := order_total * (coupon_record.value / 100);
    ELSE
        calculated_discount := coupon_record.value;
    END IF;
    
    -- Aplicar límite máximo de descuento si existe
    IF coupon_record.max_discount_amount IS NOT NULL AND calculated_discount > coupon_record.max_discount_amount THEN
        calculated_discount := coupon_record.max_discount_amount;
    END IF;
    
    -- No puede ser mayor que el total del pedido
    IF calculated_discount > order_total THEN
        calculated_discount := order_total;
    END IF;
    
    -- Cupón válido
    RETURN QUERY SELECT true, coupon_record.id, calculated_discount, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. FUNCIÓN PARA USAR UN CUPÓN
-- =====================================================

CREATE OR REPLACE FUNCTION use_coupon(
    coupon_code VARCHAR(50),
    order_id VARCHAR(50),
    customer_id UUID,
    discount_amount DECIMAL(10,2)
)
RETURNS BOOLEAN AS $$
DECLARE
    coupon_id UUID;
BEGIN
    -- Obtener el ID del cupón
    SELECT id INTO coupon_id
    FROM coupons 
    WHERE code = coupon_code AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Registrar el uso del cupón
    INSERT INTO coupon_usage (coupon_id, order_id, customer_id, discount_amount)
    VALUES (coupon_id, order_id, customer_id, discount_amount);
    
    -- Incrementar el contador de uso
    UPDATE coupons 
    SET used_count = used_count + 1,
        updated_at = NOW()
    WHERE id = coupon_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_coupons_updated_at ON coupons;
CREATE TRIGGER trigger_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_coupons_updated_at();

-- =====================================================
-- 6. ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_dates ON coupons(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order_id ON coupon_usage(order_id);

-- =====================================================
-- 7. INSERTAR CUPONES DE EJEMPLO
-- =====================================================

INSERT INTO coupons (code, name, description, type, value, min_order_amount, usage_limit, is_active)
VALUES 
    ('DESCUENTO10', 'Descuento 10%', 'Descuento del 10% en tu pedido', 'percentage', 10, 0, NULL, true),
    ('BIENVENIDO', 'Cupón de Bienvenida', 'Descuento de $2000 para nuevos clientes', 'fixed', 2000, 10000, 100, true),
    ('ENVIOGRATIS', 'Envío Gratis', 'Descuento equivalente al costo de envío', 'fixed', 3000, 15000, NULL, true),
    ('VERANO2025', 'Promoción Verano', '15% de descuento máximo $5000', 'percentage', 15, 20000, 200, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 8. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que la tabla se creó correctamente
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('coupons', 'coupon_usage');

-- Verificar columnas de coupons
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'coupons' 
ORDER BY ordinal_position;

-- Verificar cupones de ejemplo
SELECT code, name, type, value, is_active FROM coupons;

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
-- 1. Ejecuta este archivo en el SQL Editor de Supabase
-- 2. Esto creará las tablas y funciones necesarias
-- 3. Se insertarán algunos cupones de ejemplo
-- 4. Las funciones validate_coupon() y use_coupon() estarán listas para usar
-- =====================================================
