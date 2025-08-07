import React from 'react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { Clock, Truck, Phone, X } from 'lucide-react';

interface InfoBarProps {
  className?: string;
}

const InfoBar: React.FC<InfoBarProps> = ({ className = '' }) => {
  const { config, loading } = useSystemConfig();
  const [isVisible, setIsVisible] = React.useState(true);

  // No mostrar si está desactivado en configuración
  if (loading || config.info_bar_active !== 'true') {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={`bg-gradient-to-r from-yellow-600 to-yellow-500 text-black py-2 px-4 relative ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm font-medium">
          {config.info_bar_message && (
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <span>{config.info_bar_message}</span>
            </div>
          )}
          
          {config.info_bar_secondary && (
            <div className="flex items-center space-x-2">
              <Truck size={16} />
              <span>{config.info_bar_secondary}</span>
            </div>
          )}
          
          {config.whatsapp_number && (
            <div className="flex items-center space-x-2">
              <Phone size={16} />
              <span>WhatsApp: {config.whatsapp_number}</span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className="text-black hover:text-gray-700 transition-colors"
          aria-label="Cerrar barra de información"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default InfoBar;