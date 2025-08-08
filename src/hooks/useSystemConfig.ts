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
  // Nuevos campos
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

export const useSystemConfig = () => {
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
      
      // Helpers de parseo seguro
      const parseArraySafe = (val: any): string[] => {
        try {
          if (Array.isArray(val)) return val as string[];
          if (typeof val === 'string' && val.trim().length) {
            const p = JSON.parse(val);
            return Array.isArray(p) ? p : [];
          }
          return [];
        } catch (e) {
          console.warn('⚠️ available_communes inválido, usando []', e);
          return [];
        }
      };
      const parseObjectSafe = (val: any): Record<string, any> => {
        try {
          if (val && typeof val === 'object' && !Array.isArray(val)) return val as Record<string, any>;
          if (typeof val === 'string' && val.trim().length) {
            const p = JSON.parse(val);
            return p && typeof p === 'object' && !Array.isArray(p) ? p : {};
          }
          return {};
        } catch (e) {
          console.warn('⚠️ business_hours inválido, usando {}', e);
          return {};
        }
      };

      // Procesar configuraciones (a prueba de errores)
      const processedConfig: SystemConfig = {
        admin_email: String(configData.admin_email || ''),
        whatsapp_number: String(configData.whatsapp_number || '+56912345678'),
        shipping_cost: String(configData.shipping_cost || '3000'),
        minimum_order: String(configData.minimum_order || '20000'),
        available_communes: parseArraySafe(configData.available_communes),
        confirmation_message: String(configData.confirmation_message || 'Gracias por tu pedido.'),
        business_hours: parseObjectSafe(configData.business_hours),
        delivery_time: String(configData.delivery_time || '24-48 horas'),
        info_bar_message: String(configData.info_bar_message || ''),
        info_bar_secondary: String(configData.info_bar_secondary || ''),
        info_bar_active: String(configData.info_bar_active || 'true'),
        // Nuevos campos
        hero_title: String(configData.hero_title || 'Carnicería Premium'),
        hero_subtitle: String(configData.hero_subtitle || 'Las mejores carnes frescas, seleccionadas especialmente para tu mesa. Calidad premium, servicio excepcional.'),
        offers_section_title: String(configData.offers_section_title || 'Ofertas del Día'),
        categories_section_title: String(configData.categories_section_title || 'Nuestras Categorías'),
        footer_company_name: String(configData.footer_company_name || 'LA ALIANZA CARNICERIAS'),
        footer_description: String(configData.footer_description || 'Tu carnicería de confianza con las mejores carnes premium de Santiago.'),
        footer_address: String(configData.footer_address || 'Santiago, Chile'),
        footer_phone: String(configData.footer_phone || '+56912345678'),
        footer_email: String(configData.footer_email || 'contacto@laalianza.cl'),
        footer_social_facebook: String(configData.footer_social_facebook || ''),
        footer_social_instagram: String(configData.footer_social_instagram || ''),
        footer_active: String(configData.footer_active || 'true')
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
    
    // NUEVO: Escuchar cambios de configuración
    const handleConfigUpdate = () => {
      console.log('🔄 Configuración actualizada, recargando...');
      loadConfig();
    };
    
    window.addEventListener('configurationUpdated', handleConfigUpdate);
    
    return () => {
      window.removeEventListener('configurationUpdated', handleConfigUpdate);
    };
  }, []);

  return {
    config,
    loading,
    error,
    reload: loadConfig
  };
};