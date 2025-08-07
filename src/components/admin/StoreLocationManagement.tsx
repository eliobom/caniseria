import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Eye, EyeOff, Phone, Clock, Save, X } from 'lucide-react';
import { 
  getStoreLocations, 
  getAllStoreLocations, 
  createStoreLocation, 
  updateStoreLocation, 
  deleteStoreLocation, 
  toggleStoreLocationStatus 
} from '../../services/supabaseService';

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
  created_at?: string;
  updated_at?: string;
}

const StoreLocationManagement: React.FC = () => {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StoreLocation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    commune: '',
    phone: '',
    hours: '',
    latitude: 0,
    longitude: 0,
    description: '',
    is_active: true
  });

  const comunas = [
    'Las Condes', 'Providencia', 'Ñuñoa', 'Santiago Centro', 'Maipú', 'La Florida',
    'Puente Alto', 'Peñalolén', 'San Miguel', 'Independencia', 'Recoleta', 'Quilicura',
    'Huechuraba', 'Vitacura', 'Lo Barnechea', 'Macul', 'San Joaquín', 'La Reina',
    'Estación Central', 'Cerrillos', 'Pedro Aguirre Cerda', 'Lo Espejo', 'San Ramón',
    'La Cisterna', 'El Bosque', 'La Granja', 'San Bernardo', 'Calera de Tango',
    'Padre Hurtado', 'Melipilla', 'Talagante', 'Peñaflor', 'Isla de Maipo'
  ];

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const data = await getAllStoreLocations();
      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
      setFeedback({ type: 'error', message: 'Error al cargar los locales' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      commune: '',
      phone: '',
      hours: '',
      latitude: 0,
      longitude: 0,
      description: '',
      is_active: true
    });
    setEditingLocation(null);
  };

  const handleEdit = (location: StoreLocation) => {
    setFormData({
      name: location.name,
      address: location.address,
      commune: location.commune,
      phone: location.phone,
      hours: location.hours,
      latitude: location.latitude,
      longitude: location.longitude,
      description: location.description || '',
      is_active: location.is_active
    });
    setEditingLocation(location);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.address.trim() || !formData.commune || !formData.phone.trim()) {
      setFeedback({ type: 'error', message: 'Por favor completa todos los campos obligatorios' });
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (editingLocation) {
        await updateStoreLocation(editingLocation.id, formData);
        setFeedback({ type: 'success', message: 'Local actualizado exitosamente' });
      } else {
        await createStoreLocation(formData);
        setFeedback({ type: 'success', message: 'Local creado exitosamente' });
      }
      
      await loadLocations();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving location:', error);
      setFeedback({ type: 'error', message: 'Error al guardar el local' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este local?')) return;
    
    try {
      await deleteStoreLocation(id);
      await loadLocations();
      setFeedback({ type: 'success', message: 'Local eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting location:', error);
      setFeedback({ type: 'error', message: 'Error al eliminar el local' });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStoreLocationStatus(id, !currentStatus);
      await loadLocations();
      setFeedback({ 
        type: 'success', 
        message: `Local ${!currentStatus ? 'activado' : 'desactivado'} exitosamente` 
      });
    } catch (error) {
      console.error('Error toggling location status:', error);
      setFeedback({ type: 'error', message: 'Error al cambiar el estado del local' });
    }
  };

  const getCoordinatesFromAddress = async (address: string, commune: string) => {
    // Aquí podrías integrar con una API de geocodificación como Google Maps
    // Por ahora, asignamos coordenadas aproximadas de Santiago
    const defaultCoords = {
      latitude: -33.4489 + (Math.random() - 0.5) * 0.1,
      longitude: -70.6693 + (Math.random() - 0.5) * 0.1
    };
    
    setFormData(prev => ({
      ...prev,
      latitude: defaultCoords.latitude,
      longitude: defaultCoords.longitude
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gestión de Locales</h1>
            <p className="text-gray-400 text-lg">Administra los locales en Santiago de Chile</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            Agregar Local
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`p-4 rounded-lg border ${
            feedback.type === 'success' 
              ? 'bg-green-900/50 border-green-500 text-green-200'
              : 'bg-red-900/50 border-red-500 text-red-200'
          }`}>
            {feedback.message}
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <div className="text-3xl font-bold text-white mb-1">{locations.length}</div>
            <div className="text-gray-400 text-sm font-medium">Total Locales</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {locations.filter(l => l.is_active).length}
            </div>
            <div className="text-gray-400 text-sm font-medium">Activos</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <div className="text-3xl font-bold text-red-400 mb-1">
              {locations.filter(l => !l.is_active).length}
            </div>
            <div className="text-gray-400 text-sm font-medium">Inactivos</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {new Set(locations.map(l => l.commune)).size}
            </div>
            <div className="text-gray-400 text-sm font-medium">Comunas</div>
          </div>
        </div>

        {/* Lista de Locales */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-semibold text-white">Locales ({locations.length})</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <div className="text-white mt-4">Cargando locales...</div>
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="text-gray-400 mx-auto mb-4" size={48} />
              <div className="text-gray-400 text-lg">No hay locales registrados</div>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="mt-4 text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Agregar el primer local
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {locations.map((location) => (
                <div key={location.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-full ${
                          location.is_active ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          <MapPin size={16} className="text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">{location.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          location.is_active 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {location.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400 block">Dirección</span>
                          <span className="text-white font-medium">{location.address}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Comuna</span>
                          <span className="text-white font-medium">{location.commune}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Teléfono</span>
                          <span className="text-white font-medium">{location.phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Horarios</span>
                          <span className="text-white font-medium">{location.hours}</span>
                        </div>
                        {location.description && (
                          <div className="md:col-span-2">
                            <span className="text-gray-400 block">Descripción</span>
                            <span className="text-white font-medium">{location.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEdit(location)}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                      >
                        <Edit size={14} />
                        Editar
                      </button>
                      
                      <button
                        onClick={() => handleToggleStatus(location.id, location.is_active)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                          location.is_active
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {location.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                        {location.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(location.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingLocation ? 'Editar Local' : 'Agregar Nuevo Local'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Nombre del Local *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                        placeholder="Ej: Carnicería Premium Las Condes"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Comuna *
                      </label>
                      <select
                        value={formData.commune}
                        onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                        required
                      >
                        <option value="">Seleccionar comuna</option>
                        {comunas.map(comuna => (
                          <option key={comuna} value={comuna}>{comuna}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Dirección Completa *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        if (e.target.value && formData.commune) {
                          getCoordinatesFromAddress(e.target.value, formData.commune);
                        }
                      }}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                      placeholder="Ej: Av. Apoquindo 1234"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                        placeholder="Ej: +56 9 1234 5678"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Horarios de Atención *
                      </label>
                      <input
                        type="text"
                        value={formData.hours}
                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                        placeholder="Ej: Lun-Vie 9:00-19:00, Sáb 9:00-14:00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                      placeholder="Información adicional sobre el local..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2"
                    />
                    <label htmlFor="is_active" className="text-gray-300">
                      Local activo (visible para los clientes)
                    </label>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Save size={18} />
                      )}
                      {editingLocation ? 'Actualizar' : 'Crear'} Local
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreLocationManagement;