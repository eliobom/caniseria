import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Clock } from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';

const Footer: React.FC = () => {
  const { config, loading } = useSystemConfig();

  if (loading || config.footer_active !== 'true') {
    return null;
  }

  return (
    <footer className="bg-black border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la empresa */}
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-4">
              {config.footer_company_name || 'LA ALIANZA CARNICERIAS'}
            </h3>
            <p className="text-gray-300 mb-4">
              {config.footer_description || 'Tu carnicería de confianza con las mejores carnes premium de Santiago.'}
            </p>
            <div className="flex space-x-4">
              {config.footer_social_facebook && (
                <a
                  href={config.footer_social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <Facebook size={24} />
                </a>
              )}
              {config.footer_social_instagram && (
                <a
                  href={config.footer_social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <Instagram size={24} />
                </a>
              )}
            </div>
          </div>

          {/* Información de contacto */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contacto</h4>
            <div className="space-y-3">
              {config.footer_address && (
                <div className="flex items-center text-gray-300">
                  <MapPin size={16} className="mr-2 text-yellow-400" />
                  <span>{config.footer_address}</span>
                </div>
              )}
              {config.footer_phone && (
                <div className="flex items-center text-gray-300">
                  <Phone size={16} className="mr-2 text-yellow-400" />
                  <a href={`tel:${config.footer_phone}`} className="hover:text-yellow-400 transition-colors">
                    {config.footer_phone}
                  </a>
                </div>
              )}
              {config.footer_email && (
                <div className="flex items-center text-gray-300">
                  <Mail size={16} className="mr-2 text-yellow-400" />
                  <a href={`mailto:${config.footer_email}`} className="hover:text-yellow-400 transition-colors">
                    {config.footer_email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Horarios */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Horarios de Atención</h4>
            <div className="flex items-start text-gray-300">
              <Clock size={16} className="mr-2 text-yellow-400 mt-1" />
              <div>
                <p>Lun - Vie: 9:00 - 18:00</p>
                <p>Sábado: 9:00 - 14:00</p>
                <p>Domingo: 10:00 - 13:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} {config.footer_company_name || 'LA ALIANZA CARNICERIAS'}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;