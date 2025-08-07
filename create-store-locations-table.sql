-- Crear tabla para locales
CREATE TABLE IF NOT EXISTS store_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  commune VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  hours TEXT NOT NULL,
  latitude DECIMAL(10, 8) DEFAULT -33.4489,
  longitude DECIMAL(11, 8) DEFAULT -70.6693,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_store_locations_is_active ON store_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_store_locations_commune ON store_locations(commune);
CREATE INDEX IF NOT EXISTS idx_store_locations_created_at ON store_locations(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE store_locations ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (cualquiera puede ver locales activos)
CREATE POLICY "Allow public read access to active store locations" ON store_locations
  FOR SELECT USING (is_active = true);

-- Política para administradores (pueden hacer todo)
CREATE POLICY "Allow admin full access to store locations" ON store_locations
  FOR ALL USING (auth.role() = 'authenticated');

-- Insertar algunos locales de ejemplo
INSERT INTO store_locations (name, address, commune, phone, hours, latitude, longitude, description) VALUES
('Carnicería Premium Las Condes', 'Av. Apoquindo 1234', 'Las Condes', '+56 9 1234 5678', 'Lun-Vie 9:00-19:00, Sáb 9:00-14:00', -33.4150, -70.6050, 'Local principal con la mayor variedad de productos premium'),
('Carnicería Premium Providencia', 'Av. Providencia 567', 'Providencia', '+56 9 2345 6789', 'Lun-Vie 8:30-19:30, Sáb 8:30-15:00', -33.4372, -70.6344, 'Especialistas en cortes gourmet y carnes importadas'),
('Carnicería Premium Ñuñoa', 'Av. Irarrázaval 890', 'Ñuñoa', '+56 9 3456 7890', 'Lun-Vie 9:00-18:30, Sáb 9:00-13:00', -33.4569, -70.6011, 'Atención personalizada y productos frescos diarios');