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
  hero_title?: string;
  hero_subtitle?: string;
  offers_section_title?: string;
  categories_section_title?: string;
  footer_company_name?: string;
  footer_description?: string;
  footer_address?: string;
  footer_phone?: string;
  footer_email?: string;
  footer_social_facebook?: string;
  footer_social_instagram?: string;
  footer_active?: string;
}

export const useSystemConfigFixed = () => {
  const [config, setConfig] = useState<SystemConfig>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando configuraciones del sistema...');
      const configData = await getConfigurationsAsObject();
      console.log('📊 Configuraciones cargadas:', configData);
      
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
        info_bar_active: configData.info_bar_active || 'true',
        hero_title: configData.hero_title || 'Carnicería Premium',
        hero_subtitle: configData.hero_subtitle || 'Las mejores carnes frescas, seleccionadas especialmente para tu mesa. Calidad premium, servicio excepcional.',
        offers_section_title: configData.offers_section_title || 'Ofertas del Día',
        categories_section_title: configData.categories_section_title || 'Nuestras Categorías',
        footer_company_name: configData.footer_company_name || 'LA ALIANZA CARNICERIAS',
        footer_description: configData.footer_description || 'Tu carnicería de confianza con las mejores carnes premium de Santiago.',
        footer_address: configData.footer_address || 'Santiago, Chile',
        footer_phone: configData.footer_phone || '+56912345678',
        footer_email: configData.footer_email || 'contacto@laalianza.cl',
        footer_social_facebook: configData.footer_social_facebook || '',
        footer_social_instagram: configData.footer_social_instagram || '',
        footer_active: configData.footer_active || 'true'
      };
      
      console.log('✅ Configuraciones procesadas:', processedConfig);
      setConfig(processedConfig);
    } catch (err: any) {
      console.error('❌ Error loading system config:', err);
      setError(err.message || 'Error al cargar configuración');
      
      // Configuración por defecto en caso de error
      const fallbackConfig: SystemConfig = {
        footer_active: 'true',
        footer_company_name: 'LA ALIANZA CARNICERIAS',
        footer_description: 'Tu carnicería de confianza con las mejores carnes premium de Santiago.',
        footer_address: 'Santiago, Chile',
        footer_phone: '+56912345678',
        footer_email: 'contacto@laalianza.cl',
        footer_social_facebook: '',
        footer_social_instagram: '',
        hero_title: 'Carnicería Premium',
        hero_subtitle: 'Las mejores carnes frescas, seleccionadas especialmente para tu mesa. Calidad premium, servicio excepcional.',
        offers_section_title: 'Ofertas del Día',
        categories_section_title: 'Nuestras Categorías'
      };
      
      console.log('🔄 Usando configuración por defecto:', fallbackConfig);
      setConfig(fallbackConfig);
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