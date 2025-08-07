import { useState, useEffect } from 'react';
import { getConfigurationsAsObject } from '../services/supabaseService';

interface SystemConfig {
  admin_email?: string;
  whatsapp_number?: string;
  shipping_cost?: string;
  minimum_order?: string;
  available_communes?: string[];
  confirmation_message?: string;
  business_hours?: any;
  delivery_time?: string;
  info_bar_message?: string;
  info_bar_secondary?: string;
  info_bar_active?: string;
}

export const useSystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const configData = await getConfigurationsAsObject();
      
      // Procesar configuraciones
      const processedConfig: SystemConfig = {
        admin_email: configData.admin_email || '',
        whatsapp_number: configData.whatsapp_number || '+56912345678',
        shipping_cost: configData.shipping_cost || '3000',
        minimum_order: configData.minimum_order || '20000',
        available_communes: configData.available_communes ? 
          (Array.isArray(configData.available_communes) ? 
            configData.available_communes : 
            JSON.parse(configData.available_communes || '[]')
          ) : [],
        confirmation_message: configData.confirmation_message || 'Gracias por tu pedido.',
        business_hours: configData.business_hours ? 
          (typeof configData.business_hours === 'string' ? 
            JSON.parse(configData.business_hours) : 
            configData.business_hours
          ) : {},
        delivery_time: configData.delivery_time || '24-48 horas',
        info_bar_message: configData.info_bar_message || '',
        info_bar_secondary: configData.info_bar_secondary || '',
        info_bar_active: configData.info_bar_active || 'true'
      };
      
      setConfig(processedConfig);
    } catch (err: any) {
      console.error('Error loading system config:', err);
      setError(err.message || 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    loading,
    error,
    reload: loadConfig
  };
};