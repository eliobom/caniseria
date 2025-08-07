-- Tabla de ofertas diarias
CREATE TABLE IF NOT EXISTS daily_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 1 AND discount_percentage <= 99),
  original_price DECIMAL(10, 2) NOT NULL,
  discounted_price DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS daily_offers_product_id_idx ON daily_offers(product_id);
CREATE INDEX IF NOT EXISTS daily_offers_is_active_idx ON daily_offers(is_active);
CREATE INDEX IF NOT EXISTS daily_offers_date_range_idx ON daily_offers(start_date, end_date);

-- Función para actualizar el precio con descuento automáticamente
CREATE OR REPLACE FUNCTION update_discounted_price()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.discounted_price = NEW.original_price * (100 - NEW.discount_percentage) / 100;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular automáticamente el precio con descuento
CREATE TRIGGER calculate_discounted_price
  BEFORE INSERT OR UPDATE ON daily_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_discounted_price();

-- Trigger para actualizar el timestamp de updated_at
CREATE TRIGGER update_daily_offers_updated_at
  BEFORE UPDATE ON daily_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Políticas RLS para daily_offers
ALTER TABLE daily_offers ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura de ofertas activas
CREATE POLICY "Allow read active daily offers"
  ON daily_offers FOR SELECT
  USING (is_active = true AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE);

-- Política para permitir todas las operaciones a los administradores
CREATE POLICY "Allow all operations for admins"
  ON daily_offers FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));
