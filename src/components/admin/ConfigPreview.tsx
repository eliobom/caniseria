import React from 'react';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import BusinessHours from '../BusinessHours';
import { Phone, Mail, Truck, Clock } from 'lucide-react';

const ConfigPreview: React.FC = () => {
  const { config, loading } = useSystemConfig();

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Vista Previa de Configuración</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información de Contacto */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-yellow-400">Contacto</h4>
          
          {config.whatsapp_number && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="text-green-400" size={16} />
              <span className="text-gray-300">WhatsApp:</span>
              <span className="text-white">{config.whatsapp_number}</span>
            </div>
          )}
          
          {config.admin_email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="text-blue-400" size={16} />
              <span className="text-gray-300">Email:</span>
              <span className="text-white">{config.admin_email}</span>
            </div>
          )}
        </div>
        
        {/* Información de Delivery */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-yellow-400">Delivery</h4>
          
          <div className="flex items-center space-x-2 text-sm">
            <Truck className="text-yellow-400" size={16} />
            <span className="text-gray-300">Costo:</span>
            <span className="text-white">${parseInt(config.shipping_cost || '0').toLocaleString()}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-300">Pedido mínimo:</span>
            <span className="text-white">${parseInt(config.minimum_order || '0').toLocaleString()}</span>
          </div>
          
          {config.delivery_time && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="text-purple-400" size={16} />
              <span className="text-gray-300">Tiempo:</span>
              <span className="text-white">{config.delivery_time}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Horarios de Atención */}
      {config.business_hours && Object.keys(config.business_hours).length > 0 && (
        <div className="mt-4">
          <BusinessHours showTitle={true} />
        </div>
      )}
      
      {/* Mensaje de Confirmación */}
      {config.confirmation_message && (
        <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded">
          <h5 className="text-green-400 font-medium mb-1">Mensaje de Confirmación:</h5>
          <p className="text-green-200 text-sm">{config.confirmation_message}</p>
        </div>
      )}
    </div>
  );
};

export default ConfigPreview;