import React from 'react';
import { useSystemConfig } from '../hooks/useSystemConfig';

const WhatsAppButton: React.FC = () => {
  const { config, loading } = useSystemConfig();

  const handleWhatsAppClick = () => {
    // Usar el número de WhatsApp de la configuración o el por defecto
    const whatsappNumber = config.whatsapp_number || '+56912345678';
    
    // Limpiar el número (remover espacios, guiones, etc.)
    const cleanNumber = whatsappNumber.replace(/[^+\d]/g, '');
    
    const message = encodeURIComponent(
      'Hola, me gustaría obtener más información sobre sus productos.'
    );
    
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  // No mostrar el botón si está cargando o no hay número configurado
  if (loading || !config.whatsapp_number) {
    return null;
  }

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 left-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 active:bg-green-700 transition-colors z-40 flex items-center justify-center"
      aria-label="Contactar por WhatsApp"
      title={`Contactar al ${config.whatsapp_number}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.55 15.58C16.28 16.11 15.3 16.71 14.67 16.85C14.2 16.95 13.59 17.03 11.36 16.12C8.59 15.01 6.8 12.19 6.67 12.03C6.55 11.87 5.5 10.45 5.5 8.95C5.5 7.45 6.24 6.74 6.5 6.47C6.73 6.24 7.05 6.15 7.35 6.15C7.45 6.15 7.54 6.15 7.62 6.16C7.88 6.17 8 6.18 8.16 6.5C8.36 6.92 8.79 8.42 8.85 8.56C8.91 8.7 8.97 8.89 8.89 9.07C8.81 9.26 8.74 9.34 8.6 9.5C8.46 9.66 8.33 9.78 8.19 9.95C8.07 10.1 7.93 10.26 8.1 10.54C8.27 10.82 8.78 11.69 9.56 12.39C10.57 13.29 11.38 13.58 11.7 13.7C11.93 13.79 12.21 13.77 12.38 13.59C12.59 13.37 12.85 13 13.12 12.72C13.31 12.53 13.56 12.5 13.82 12.59C14.09 12.68 15.56 13.4 15.85 13.55C16.14 13.7 16.32 13.77 16.38 13.89C16.44 14.01 16.44 14.47 16.17 15L16.55 15.58Z" />
      </svg>
      <span className="sr-only">Contactar por WhatsApp</span>
    </button>
  );
};

export default WhatsAppButton;