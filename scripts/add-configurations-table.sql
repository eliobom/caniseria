-- Tabla de configuraciones del sistema
CREATE TABLE IF NOT EXISTS system_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_system_configurations_updated_at
BEFORE UPDATE ON system_configurations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Insertar configuraciones por defecto
INSERT INTO system_configurations (key, value, description, category) VALUES
('business_hours', '{"monday":{"open":"09:00","close":"18:00","closed":false},"tuesday":{"open":"09:00","close":"18:00","closed":false},"wednesday":{"open":"09:00","close":"18:00","closed":false},"thursday":{"open":"09:00","close":"18:00","closed":false},"friday":{"open":"09:00","close":"18:00","closed":false},"saturday":{"open":"09:00","close":"14:00","closed":false},"sunday":{"open":"10:00","close":"13:00","closed":false}}', 'Horarios de atención del negocio', 'schedule'),
('delivery_types', '[{"id":"delivery","name":"Delivery a domicilio","description":"Entrega en tu hogar","cost":2500,"estimatedTime":"30-45 min","active":true},{"id":"pickup","name":"Retiro en tienda","description":"Retira tu pedido en nuestra tienda","cost":0,"estimatedTime":"15-20 min","active":true},{"id":"express","name":"Delivery Express","description":"Entrega rápida en 20 minutos","cost":4000,"estimatedTime":"15-20 min","active":true}]', 'Tipos de despacho disponibles', 'delivery'),
('info_bar_message', 'Horarios de atención: Lun-Vie 9:00-18:00 | Sáb 9:00-14:00 | Dom 10:00-13:00', 'Mensaje principal de la barra de información', 'display'),
('info_bar_secondary', 'Delivery gratis en compras sobre $25.000', 'Mensaje secundario de la barra de información', 'display'),
('info_bar_active', 'true', 'Activar/desactivar la barra de información', 'display'),
('whatsapp_number', '+56912345678', 'Número de WhatsApp para contacto', 'contact'),
('admin_email', 'admin@carniceriapremium.cl', 'Email del administrador', 'contact'),
('shipping_cost', '2500', 'Costo de envío por defecto', 'pricing'),
('minimum_order', '15000', 'Monto mínimo de pedido', 'pricing'),
('available_communes', '["Las Condes","Providencia","Ñuñoa","Santiago Centro","Vitacura","La Reina"]', 'Comunas disponibles para delivery', 'delivery'),
('confirmation_message', 'Gracias por tu pedido. Te contactaremos pronto para confirmar los detalles.', 'Mensaje de confirmación de pedido', 'messaging')
ON CONFLICT (key) DO NOTHING;