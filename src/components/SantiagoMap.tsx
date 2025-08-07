import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { getStoreLocations } from '../services/supabaseService';

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  commune: string;
  phone: string;
  hours: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  description?: string;
}

const SantiagoMap: React.FC = () => {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<StoreLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const data = await getStoreLocations();
      setLocations(data || []);
    } catch (error) {
      console.error('Error loading store locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openInGoogleMaps = (location: StoreLocation) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address + ', ' + location.commune + ', Santiago, Chile')}`;
    window.open(url, '_blank');
  };

  const callStore = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <MapPin className="text-yellow-400 mr-3" size={32} />
          <h2 className="text-3xl font-bold text-white">Nuestros Locales en Santiago</h2>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Encuentra el local más cercano a ti. Calidad premium en toda la ciudad.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          <div className="text-white mt-4">Cargando locales...</div>
        </div>
      ) : (
        <>
          {/* Mapa Visual Simplificado */}
          <div className="relative bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-xl p-8 mb-8 min-h-[400px] border border-gray-600/30">
            <div className="absolute inset-0 opacity-20"></div>
            
            {/* Título del Mapa */}
            <div className="text-center mb-6 relative z-10">
              <h3 className="text-xl font-semibold text-white mb-2">Mapa de Santiago</h3>
              <p className="text-gray-400 text-sm">Haz clic en un local para ver más detalles</p>
            </div>

            {/* Locales en el Mapa */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location, index) => (
                <div
                  key={location.id}
                  className={`bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border transition-all duration-200 cursor-pointer hover:scale-105 ${
                    selectedLocation?.id === location.id
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-400 text-black rounded-full p-2 flex-shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm mb-1 truncate">{location.name}</h4>
                      <p className="text-gray-300 text-xs mb-2 line-clamp-2">{location.commune}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            callStore(location.phone);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        >
                          <Phone size={12} className="inline mr-1" />
                          Llamar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openInGoogleMaps(location);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        >
                          <Navigation size={12} className="inline mr-1" />
                          Ir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalles del Local Seleccionado */}
          {selectedLocation && (
            <div className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600/50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedLocation.name}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-yellow-400 mt-1 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-white font-medium">{selectedLocation.address}</p>
                        <p className="text-gray-300">{selectedLocation.commune}, Santiago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="text-green-400 flex-shrink-0" size={18} />
                      <p className="text-white">{selectedLocation.phone}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="text-blue-400 flex-shrink-0" size={18} />
                      <p className="text-white">{selectedLocation.hours}</p>
                    </div>
                    
                    {selectedLocation.description && (
                      <div className="mt-4">
                        <p className="text-gray-300">{selectedLocation.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
                  <button
                    onClick={() => callStore(selectedLocation.phone)}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    <Phone size={18} />
                    Llamar Local
                  </button>
                  
                  <button
                    onClick={() => openInGoogleMaps(selectedLocation)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    <Navigation size={18} />
                    Cómo Llegar
                  </button>
                </div>
              </div>
            </div>
          )}

          {locations.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="text-gray-400 mx-auto mb-4" size={48} />
              <div className="text-gray-400 text-lg">No hay locales disponibles</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SantiagoMap;