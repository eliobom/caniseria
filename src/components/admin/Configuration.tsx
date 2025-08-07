import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Download, Upload, Trash2, Eye, Settings, Phone, Mail, Clock, MapPin } from 'lucide-react';
import {
  getSystemConfigurations,
  updateSystemConfiguration,
  createSystemConfiguration,
  getConfigurationsAsObject
} from '../../services/supabaseService';

interface ConfigData {
  admin_email: string;
  whatsapp_number: string;
  shipping_cost: string;
  minimum_order: string;
  available_communes: string[];
  confirmation_message: string;
  business_hours: Record<string, any>;
  delivery_time: string;
  info_bar_message: string;
  info_bar_secondary: string;
  info_bar_active: string;
}

interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

const Configuration: React.FC = () => {
  const [configData, setConfigData] = useState<ConfigData>({
    admin_email: '',
    whatsapp_number: '+56912345678',
    shipping_cost: '3000',
    minimum_order: '20000',
    available_communes: [],
    confirmation_message: 'Gracias por tu pedido. Te contactaremos pronto.',
    business_hours: {},
    delivery_time: '24-48 horas',
    info_bar_message: '',
    info_bar_secondary: '',
    info_bar_active: 'true'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Cargar configuración al montar el componente
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      const configObj = await getConfigurationsAsObject();
      
      setConfigData({
        admin_email: configObj.admin_email || '',
        whatsapp_number: configObj.whatsapp_number || '+56912345678',
        shipping_cost: configObj.shipping_cost || '3000',
        minimum_order: configObj.minimum_order || '20000',
        available_communes: typeof configObj.available_communes === 'string' 
          ? JSON.parse(configObj.available_communes || '[]')
          : configObj.available_communes || [],
        confirmation_message: configObj.confirmation_message || 'Gracias por tu pedido. Te contactaremos pronto.',
        business_hours: typeof configObj.business_hours === 'string'
          ? JSON.parse(configObj.business_hours || '{}')
          : configObj.business_hours || {},
        delivery_time: configObj.delivery_time || '24-48 horas',
        info_bar_message: configObj.info_bar_message || '',
        info_bar_secondary: configObj.info_bar_secondary || '',
        info_bar_active: configObj.info_bar_active || 'true'
      });
    } catch (error) {
      console.error('Error loading configuration:', error);
      showMessage('error', 'Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveConfiguration = async () => {
    try {
      setIsSaving(true);
      
      // Guardar cada configuración
      const configEntries = Object.entries(configData);
      
      for (const [key, value] of configEntries) {
        let valueToSave = value;
        
        // Convertir arrays y objetos a JSON
        if (Array.isArray(value) || typeof value === 'object') {
          valueToSave = JSON.stringify(value);
        }
        
        try {
          await updateSystemConfiguration(key, String(valueToSave));
        } catch (updateError) {
          // Si no existe, crear la configuración
          await createSystemConfiguration({
            key,
            value: String(valueToSave),
            description: `Configuración de ${key}`,
            category: 'general'
          });
        }
      }
      
      showMessage('success', 'Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving configuration:', error);
      showMessage('error', 'Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key: keyof ConfigData, value: any) => {
    setConfigData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCommuneChange = (index: number, value: string) => {
    const newCommunes = [...configData.available_communes];
    newCommunes[index] = value;
    handleInputChange('available_communes', newCommunes);
  };

  const addCommune = () => {
    handleInputChange('available_communes', [...configData.available_communes, '']);
  };

  const removeCommune = (index: number) => {
    const newCommunes = configData.available_communes.filter((_, i) => i !== index);
    handleInputChange('available_communes', newCommunes);
  };

  const handleWhatsAppPreview = () => {
    const message = `¡Hola! Quiero hacer un pedido.\n\nDetalles del pedido:\n- Producto: Ejemplo\n- Cantidad: 1\n- Total: $${configData.minimum_order}\n\n${configData.confirmation_message}`;
    const url = `https://wa.me/${configData.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const exportConfiguration = () => {
    const dataStr = JSON.stringify(configData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'configuracion.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setConfigData({ ...configData, ...imported });
          showMessage('success', 'Configuración importada exitosamente');
        } catch (error) {
          showMessage('error', 'Error al importar la configuración');
        }
      };
      reader.readAsText(file);
    }
  };

  const resetConfiguration = () => {
    if (confirm('¿Estás seguro de que quieres restablecer la configuración a los valores por defecto?')) {
      setConfigData({
        admin_email: '',
        whatsapp_number: '+56912345678',
        shipping_cost: '3000',
        minimum_order: '20000',
        available_communes: [],
        confirmation_message: 'Gracias por tu pedido. Te contactaremos pronto.',
        business_hours: {},
        delivery_time: '24-48 horas',
        info_bar_message: '',
        info_bar_secondary: '',
        info_bar_active: 'true'
      });
      showMessage('info', 'Configuración restablecida a valores por defecto');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <span className="ml-3 text-white">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Configuración del Sistema</h1>
          <p className="text-gray-400 mt-1">Gestiona la configuración general de la aplicación</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye size={16} />
            <span>{showPreview ? 'Ocultar' : 'Vista Previa'}</span>
          </button>
          
          <button
            onClick={exportConfiguration}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            <span>Exportar</span>
          </button>
          
          <label className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
            <Upload size={16} />
            <span>Importar</span>
            <input
              type="file"
              accept=".json"
              onChange={importConfiguration}
              className="hidden"
            />
          </label>
          
          <button
            onClick={resetConfiguration}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={16} />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-900/50 border border-green-600 text-green-200' :
          message.type === 'error' ? 'bg-red-900/50 border border-red-600 text-red-200' :
          'bg-blue-900/50 border border-blue-600 text-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración Principal */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Settings className="mr-2" size={20} />
            Configuración General
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="inline mr-1" size={16} />
                Email del Administrador
              </label>
              <input
                type="email"
                value={configData.admin_email}
                onChange={(e) => handleInputChange('admin_email', e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                placeholder="admin@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="inline mr-1" size={16} />
                Número de WhatsApp
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={configData.whatsapp_number}
                  onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                  placeholder="+56912345678"
                />
                <button
                  onClick={handleWhatsAppPreview}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Probar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Costo de Envío ($)
                </label>
                <input
                  type="number"
                  value={configData.shipping_cost}
                  onChange={(e) => handleInputChange('shipping_cost', e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pedido Mínimo ($)
                </label>
                <input
                  type="number"
                  value={configData.minimum_order}
                  onChange={(e) => handleInputChange('minimum_order', e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="inline mr-1" size={16} />
                Tiempo de Entrega
              </label>
              <input
                type="text"
                value={configData.delivery_time}
                onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                placeholder="24-48 horas"
              />
            </div>
          </div>
        </div>

        {/* Comunas Disponibles */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <MapPin className="mr-2" size={20} />
            Comunas de Entrega
          </h2>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {configData.available_communes.map((commune, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={commune}
                  onChange={(e) => handleCommuneChange(index, e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-yellow-400 outline-none"
                  placeholder="Nombre de la comuna"
                />
                <button
                  onClick={() => removeCommune(index)}
                  className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            <button
              onClick={addCommune}
              className="w-full bg-yellow-600 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
            >
              + Agregar Comuna
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 lg:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-4">Mensajes y Notificaciones</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mensaje de Confirmación
              </label>
              <textarea
                value={configData.confirmation_message}
                onChange={(e) => handleInputChange('confirmation_message', e.target.value)}
                rows={3}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none resize-none"
                placeholder="Mensaje que se muestra al confirmar un pedido"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mensaje de Barra de Información
              </label>
              <textarea
                value={configData.info_bar_message}
                onChange={(e) => handleInputChange('info_bar_message', e.target.value)}
                rows={2}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none resize-none"
                placeholder="Mensaje principal de la barra de información"
              />
              
              <input
                type="text"
                value={configData.info_bar_secondary}
                onChange={(e) => handleInputChange('info_bar_secondary', e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none mt-2"
                placeholder="Mensaje secundario"
              />
              
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={configData.info_bar_active === 'true'}
                  onChange={(e) => handleInputChange('info_bar_active', e.target.checked ? 'true' : 'false')}
                  className="mr-2"
                />
                <label className="text-sm text-gray-300">Mostrar barra de información</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vista Previa */}
      {showPreview && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Vista Previa de Configuración</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-yellow-400 font-medium mb-2">Contacto</h3>
              <p className="text-gray-300">Email: {configData.admin_email || 'No configurado'}</p>
              <p className="text-gray-300">WhatsApp: {configData.whatsapp_number}</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-yellow-400 font-medium mb-2">Pedidos</h3>
              <p className="text-gray-300">Mínimo: ${configData.minimum_order}</p>
              <p className="text-gray-300">Envío: ${configData.shipping_cost}</p>
              <p className="text-gray-300">Entrega: {configData.delivery_time}</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-yellow-400 font-medium mb-2">Cobertura</h3>
              <p className="text-gray-300">
                {configData.available_communes.length} comunas disponibles
              </p>
              {configData.available_communes.slice(0, 3).map((commune, index) => (
                <p key={index} className="text-gray-400 text-xs">• {commune}</p>
              ))}
              {configData.available_communes.length > 3 && (
                <p className="text-gray-400 text-xs">... y {configData.available_communes.length - 3} más</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botón de Guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveConfiguration}
          disabled={isSaving}
          className="flex items-center space-x-2 bg-yellow-600 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <RefreshCw className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          <span>{isSaving ? 'Guardando...' : 'Guardar Configuración'}</span>
        </button>
      </div>
    </div>
  );
};

export default Configuration;