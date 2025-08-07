import React, { useState, useEffect } from 'react';
import { Calendar, Search, Eye, CheckCircle, XCircle, Clock, Package, Truck, X, Filter } from 'lucide-react';
import { getOrders, updateOrderStatus, getOrderById } from '../../services/supabaseService';

interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  address: string;
  commune: string;
  status: string;
  total: number;
  date: string;
  time: string;
  items?: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

const OrderManagement: React.FC = () => {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Configuración de estados
  const statusOptions = [
    { value: '', label: 'Todos los estados', color: 'bg-gray-600', icon: Filter },
    { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-500', icon: Clock },
    { value: 'confirmado', label: 'Confirmado', color: 'bg-blue-500', icon: CheckCircle },
    { value: 'preparando', label: 'Preparando', color: 'bg-purple-500', icon: Package },
    { value: 'en_camino', label: 'En Camino', color: 'bg-orange-500', icon: Truck },
    { value: 'entregado', label: 'Entregado', color: 'bg-green-500', icon: CheckCircle },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-500', icon: XCircle }
  ];

  // Efectos
  useEffect(() => {
    loadOrders();
  }, []);

  // Funciones
  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const ordersData = await getOrders();
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(option => option.value === status) || 
           { label: status, color: 'bg-gray-500', icon: Clock };
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewDetails = async (order: Order) => {
    try {
      const orderDetails = await getOrderById(order.id);
      setSelectedOrder(orderDetails || order);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading order details:', error);
      setSelectedOrder(order);
      setShowDetailModal(true);
    }
  };

  // Cálculos
  const stats = {
    total: orders.length,
    pendiente: orders.filter(o => o.status === 'pendiente').length,
    preparando: orders.filter(o => o.status === 'preparando').length,
    entregado: orders.filter(o => o.status === 'entregado').length,
    cancelado: orders.filter(o => o.status === 'cancelado').length
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    const matchesDate = !selectedDate || order.date === selectedDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Componentes auxiliares
  const StatsCard = ({ title, value, color = 'text-white' }: { title: string; value: number; color?: string }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-gray-400 text-sm font-medium">{title}</div>
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const statusInfo = getStatusInfo(status);
    const StatusIcon = statusInfo.icon;
    
    return (
      <div className="flex items-center gap-2">
        <StatusIcon size={16} className="text-white" />
        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>
    );
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Información principal */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{order.customer_name}</h3>
            <StatusBadge status={order.status} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400 block">Teléfono</span>
              <span className="text-white font-medium">{order.customer_phone}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Dirección</span>
              <span className="text-white font-medium">{order.address}, {order.commune}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Fecha</span>
              <span className="text-white font-medium">{order.date} - {order.time}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <span className="text-gray-400">Total del pedido</span>
            <span className="text-yellow-400 font-bold text-xl">${order.total.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Acciones */}
        <div className="flex flex-col gap-3 min-w-[200px]">
          <button
            onClick={() => handleViewDetails(order)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            <Eye size={16} />
            Ver Detalles
          </button>
          
          <div className="flex flex-wrap gap-1">
            {statusOptions.slice(1).map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusUpdate(order.id, status.value)}
                disabled={isUpdating || order.status === status.value}
                className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 disabled:opacity-50 ${
                  order.status === status.value
                    ? `${status.color} text-white shadow-lg`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold text-white mb-2">Gestión de Pedidos</h1>
          <p className="text-gray-400 text-lg">Administra y rastrea todos los pedidos de manera eficiente</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard title="Total Pedidos" value={stats.total} />
          <StatsCard title="Pendientes" value={stats.pendiente} color="text-yellow-400" />
          <StatsCard title="En Preparación" value={stats.preparando} color="text-purple-400" />
          <StatsCard title="Entregados" value={stats.entregado} color="text-green-400" />
          <StatsCard title="Cancelados" value={stats.cancelado} color="text-red-400" />
        </div>

        {/* Filtros */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Filtros de Búsqueda</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por cliente, teléfono o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all duration-200"
              />
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all duration-200"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Pedidos ({filteredOrders.length})</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <div className="text-white mt-4">Cargando pedidos...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No se encontraron pedidos</div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* Modal de Detalles */}
        {showDetailModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
              {!selectedOrder ? (
                <div className="text-center py-20">
                  <div className="text-red-400 text-lg font-semibold">No se pudo cargar el pedido</div>
                  <button 
                    onClick={() => setShowDetailModal(false)} 
                    className="mt-8 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <div className="p-8">
                  {/* Header del Modal */}
                  <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
                    <h2 className="text-3xl font-bold text-white">
                      Pedido #{selectedOrder.id?.slice(0, 8) || ''}
                    </h2>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Información del Cliente */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Información del Cliente</h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-gray-400 text-sm">Nombre</span>
                            <div className="text-white font-medium">{selectedOrder.customer_name || 'No disponible'}</div>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Teléfono</span>
                            <div className="text-white font-medium">{selectedOrder.customer_phone || 'No disponible'}</div>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Dirección</span>
                            <div className="text-white font-medium">
                              {selectedOrder.address ? `${selectedOrder.address}, ${selectedOrder.commune}` : 'No disponible'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información del Pedido */}
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Información del Pedido</h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-gray-400 text-sm">ID Pedido</span>
                            <div className="text-white font-medium">{selectedOrder.id || 'No disponible'}</div>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Fecha</span>
                            <div className="text-white font-medium">{selectedOrder.date || 'No disponible'}</div>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Estado Actual</span>
                            <div className="mt-2">
                              <StatusBadge status={selectedOrder.status} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Productos y Total */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Productos</h3>
                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                          <div className="space-y-3">
                            {selectedOrder.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center py-3 px-4 bg-gray-700/50 rounded-lg">
                                <div>
                                  <div className="text-white font-medium">{item.product_name}</div>
                                  <div className="text-gray-400 text-sm">{item.quantity}kg × ${item.price.toLocaleString()}</div>
                                </div>
                                <div className="text-yellow-400 font-bold">
                                  ${(item.quantity * item.price).toLocaleString()}
                                </div>
                              </div>
                            ))}
                            
                            <div className="mt-6 pt-4 border-t border-gray-700">
                              <div className="flex justify-between items-center">
                                <span className="text-white font-bold text-lg">Total:</span>
                                <span className="text-yellow-400 font-bold text-2xl">
                                  ${selectedOrder.total?.toLocaleString() || '0'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-red-400 text-center py-8">No hay productos en este pedido</div>
                        )}
                      </div>

                      {/* Actualizar Estado */}
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Actualizar Estado</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {statusOptions.slice(1).map((status) => (
                            <button
                              key={status.value}
                              onClick={() => {
                                handleStatusUpdate(selectedOrder.id, status.value);
                                setShowDetailModal(false);
                              }}
                              disabled={isUpdating || selectedOrder.status === status.value}
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                                selectedOrder.status === status.value
                                  ? `${status.color} text-white shadow-lg`
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;