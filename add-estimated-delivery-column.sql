-- Modificar la columna estimated_delivery existente para cambiar su tipo
ALTER TABLE orders 
ALTER COLUMN estimated_delivery TYPE TEXT;

-- Establecer un valor por defecto
ALTER TABLE orders 
ALTER COLUMN estimated_delivery SET DEFAULT '45-60 minutos';

-- Actualizar registros existentes que puedan tener valores nulos o inválidos
UPDATE orders 
SET estimated_delivery = '45-60 minutos' 
WHERE estimated_delivery IS NULL OR estimated_delivery = '';