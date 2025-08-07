import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, MapPin, Calendar, Eye, Loader2 } from 'lucide-react';
import { getCustomers } from '../../services/supabaseService';

const CustomerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const customersData = await getCustomers();
      setCustomers(customersData);
    } catch (err) {
      console.error('Error cargando clientes:', err);
      setError('Error al cargar los clientes. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (customer.name && customer.name.toLowerCase().includes(searchTermLower)) ||
      (customer.email && customer.email.toLowerCase().includes(searchTermLower)) ||
      (customer.phone && customer.phone.includes(searchTerm))
    );
  });

  const handleViewDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VIP':
        return 'bg-purple-900 text-purple-300';
      case 'Activo':
        return 'bg-green-900 text-green-300';
      case 'Nuevo':
        return 'bg-blue-900 text-blue-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Gestión de Clientes</h1>
        <p className="text-gray-400">Administra la base de datos de clientes</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-200">
          {error}
          <button 
            onClick={loadCustomers} 
            className="ml-4 px-3 py-1 bg-red-800 hover:bg-red-700 rounded-md text-white text-sm"
          >
            Reintentar
          </button>
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 text-yellow-400 animate-spin" />
          <span className="ml-2 text-gray-300">Cargando clientes...</span>
        </div>
      )}

      {/* Stats Cards */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Clientes</p>
                <p className="text-2xl font-bold text-white">{customers.length}</p>
              </div>
              <User className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Clientes VIP</p>
                <p className="text-2xl font-bold text-white">
                  {customers.filter(c => (c.status || '').toLowerCase() === 'vip').length}
                </p>
              </div>
              <User className="text-purple-400" size={32} />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Clientes Nuevos</p>
                <p className="text-2xl font-bold text-white">
                  {customers.filter(c => (c.status || '').toLowerCase() === 'nuevo').length}
                </p>
              </div>
              <User className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Promedio Pedidos</p>
                <p className="text-2xl font-bold text-white">
                  {customers.length > 0 
                    ? Math.round(customers.reduce((sum, c) => sum + (c.total_orders || 0), 0) / customers.length) 
                    : 0}
                </p>
              </div>
              <User className="text-yellow-400" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      {!isLoading && !error && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {searchTerm ? 'No se encontraron clientes que coincidan con la búsqueda.' : 'No hay clientes registrados.'}
            </div>
          ) : (
            <>
              {/* Desktop Table - Hidden on mobile */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left text-gray-300 px-6 py-4 font-semibold">Cliente</th>
                      <th className="text-left text-gray-300 px-6 py-4 font-semibold">Contacto</th>
                      <th className="text-left text-gray-300 px-6 py-4 font-semibold">Ubicación</th>
                      <th className="text-left text-gray-300 px-6 py-4 font-semibold">Pedidos</th>
                      <th className="text-left text-gray-300 px-6 py-4 font-semibold">Total Gastado</th>
                      <th className="text-left text-gray-300 px-6 py-4 font-semibold">Estado</th>
                      <th className="text-left text-gray-300 px-6 py-4 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-t border-gray-800 hover:bg-gray-800">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                              <span className="text-black font-bold text-sm">
                                {customer.name ? customer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-semibold">{customer.name || 'Sin nombre'}</p>
                              <p className="text-gray-400 text-sm">
                                Cliente desde {new Date(customer.join_date || customer.created_at || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {customer.email && (
                              <div className="flex items-center space-x-2">
                                <Mail size={14} className="text-gray-400" />
                                <span className="text-white text-sm">{customer.email}</span>
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone size={14} className="text-gray-400" />
                                <span className="text-white text-sm">{customer.phone}</span>
                              </div>
                            )}
                            {!customer.email && !customer.phone && (
                              <span className="text-gray-500 text-sm">Sin contacto</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-white text-sm">{customer.commune || 'No especificada'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-blue-400 font-semibold">{customer.total_orders || 0}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-400 font-semibold">
                            ${(customer.total_spent || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(customer.status || 'Activo')}`}>
                            {customer.status || 'Activo'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewDetails(customer)}
                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards - Visible only on mobile */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-black font-bold text-sm">
                          {customer.name ? customer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate mb-1">{customer.name || 'Sin nombre'}</h3>
                        <p className="text-gray-400 text-sm">
                          Cliente desde {new Date(customer.join_date || customer.created_at || Date.now()).toLocaleDateString()}
                        </p>
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(customer.status || 'Activo')}`}>
                            {customer.status || 'Activo'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      {/* Contact Info */}
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Contacto</p>
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center space-x-2">
                              <Mail size={14} className="text-gray-400" />
                              <span className="text-white text-sm">{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone size={14} className="text-gray-400" />
                              <span className="text-white text-sm">{customer.phone}</span>
                            </div>
                          )}
                          {!customer.email && !customer.phone && (
                            <span className="text-gray-500 text-sm">Sin contacto</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Location */}
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Ubicación</p>
                        <div className="flex items-center space-x-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-white text-sm">{customer.commune || 'No especificada'}</span>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Pedidos</p>
                          <span className="text-blue-400 font-semibold">{customer.total_orders || 0}</span>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total Gastado</p>
                          <span className="text-green-400 font-semibold">
                            ${(customer.total_spent || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleViewDetails(customer)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye size={16} />
                      <span>Ver Detalles</span>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Detalles del Cliente</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Información Personal</h4>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Nombre completo</p>
                      <p className="text-white">{selectedCustomer.name || 'No especificado'}</p>
                    </div>
                    {selectedCustomer.email && (
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="text-white">{selectedCustomer.email}</p>
                      </div>
                    )}
                    {selectedCustomer.phone && (
                      <div>
                        <p className="text-gray-400 text-sm">Teléfono</p>
                        <p className="text-white">{selectedCustomer.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400 text-sm">Estado</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedCustomer.status || 'Activo')}`}>
                        {selectedCustomer.status || 'Activo'}
                      </span>
                    </div>
                  </div>
                </div>

                {(selectedCustomer.address || selectedCustomer.commune) && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Dirección</h4>
                    <div className="bg-gray-800 rounded-lg p-4">
                      {selectedCustomer.address && <p className="text-white">{selectedCustomer.address}</p>}
                      {selectedCustomer.commune && <p className="text-gray-400 text-sm mt-1">{selectedCustomer.commune}</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Estadísticas</h4>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total pedidos</span>
                      <span className="text-blue-400 font-semibold">{selectedCustomer.total_orders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total gastado</span>
                      <span className="text-green-400 font-semibold">
                        ${(selectedCustomer.total_spent || 0).toLocaleString()}
                      </span>
                    </div>
                    {selectedCustomer.last_order_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Último pedido</span>
                        <span className="text-white">
                          {new Date(selectedCustomer.last_order_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cliente desde</span>
                      <span className="text-white">
                        {new Date(selectedCustomer.join_date || selectedCustomer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedCustomer.total_orders > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Promedio de Compra</h4>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-2xl font-bold text-yellow-400">
                        ${Math.round((selectedCustomer.total_spent || 0) / (selectedCustomer.total_orders || 1)).toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">por pedido</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;