import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Percent, DollarSign, Users, Search, Filter } from 'lucide-react';
import { 
  getCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon, 
  toggleCouponStatus 
} from '../../services/supabaseService';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CouponManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    min_order_amount: 0,
    max_discount_amount: '',
    usage_limit: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await getCoupons();
      setCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
      setMessage({type: 'error', text: 'Error al cargar los cupones'});
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.code.trim()) errors.code = 'El código es requerido';
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (formData.value <= 0) errors.value = 'El valor debe ser mayor a 0';
    if (formData.type === 'percentage' && formData.value > 100) {
      errors.value = 'El porcentaje no puede ser mayor a 100';
    }
    if (formData.min_order_amount < 0) errors.min_order_amount = 'El monto mínimo no puede ser negativo';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitLoading(true);
    
    try {
      const couponData = {
        ...formData,
        code: formData.code.toUpperCase(),
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        end_date: formData.end_date || null
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, couponData);
        setMessage({type: 'success', text: 'Cupón actualizado exitosamente'});
      } else {
        await createCoupon(couponData);
        setMessage({type: 'success', text: 'Cupón creado exitosamente'});
      }
      
      await loadCoupons();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      setMessage({type: 'error', text: error.message || 'Error al guardar el cupón'});
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      start_date: coupon.start_date.split('T')[0],
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
      is_active: coupon.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el cupón "${coupon.code}"?`)) return;
    
    try {
      await deleteCoupon(coupon.id);
      setMessage({type: 'success', text: 'Cupón eliminado exitosamente'});
      await loadCoupons();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      setMessage({type: 'error', text: 'Error al eliminar el cupón'});
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await toggleCouponStatus(coupon.id, !coupon.is_active);
      setMessage({type: 'success', text: `Cupón ${!coupon.is_active ? 'activado' : 'desactivado'} exitosamente`});
      await loadCoupons();
    } catch (error: any) {
      console.error('Error toggling coupon status:', error);
      setMessage({type: 'error', text: 'Error al cambiar el estado del cupón'});
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      min_order_amount: 0,
      max_discount_amount: '',
      usage_limit: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      is_active: true
    });
    setFormErrors({});
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && coupon.is_active) ||
                         (filterStatus === 'inactive' && !coupon.is_active);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const formatValue = (coupon: Coupon) => {
    return coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toLocaleString()}`;
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.is_active) return { text: 'Inactivo', color: 'text-red-400' };
    
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = coupon.end_date ? new Date(coupon.end_date) : null;
    
    if (startDate > now) return { text: 'Programado', color: 'text-blue-400' };
    if (endDate && endDate < now) return { text: 'Expirado', color: 'text-red-400' };
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { text: 'Agotado', color: 'text-orange-400' };
    }
    
    return { text: 'Activo', color: 'text-green-400' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Cupones</h1>
          <p className="text-gray-400">Administra cupones de descuento y promociones</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Cupón
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900 border border-green-600' : 'bg-red-900 border border-red-600'}`}>
          <p className={message.type === 'success' ? 'text-green-200' : 'text-red-200'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar cupones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 text-white py-2 pl-10 pr-4 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-gray-800 text-white py-2 pl-10 pr-8 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando cupones...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No se encontraron cupones</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => {
            const status = getCouponStatus(coupon);
            return (
              <div key={coupon.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{coupon.code}</h3>
                    <p className="text-gray-400 text-sm">{coupon.name}</p>
                  </div>
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.text}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    {coupon.type === 'percentage' ? (
                      <Percent size={16} className="text-yellow-400" />
                    ) : (
                      <DollarSign size={16} className="text-yellow-400" />
                    )}
                    <span className="text-white font-medium">{formatValue(coupon)}</span>
                  </div>
                  
                  {coupon.min_order_amount > 0 && (
                    <p className="text-gray-400 text-sm">
                      Mínimo: ${coupon.min_order_amount.toLocaleString()}
                    </p>
                  )}
                  
                  {coupon.usage_limit && (
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-gray-400 text-sm">
                        {coupon.used_count}/{coupon.usage_limit} usos
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-400 text-sm">
                      {formatDate(coupon.start_date)}
                      {coupon.end_date && ` - ${formatDate(coupon.end_date)}`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(coupon)}
                    className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      coupon.is_active 
                        ? 'bg-red-900 hover:bg-red-800 text-red-200' 
                        : 'bg-green-900 hover:bg-green-800 text-green-200'
                    }`}
                  >
                    {coupon.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                    {coupon.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="bg-blue-900 hover:bg-blue-800 text-blue-200 py-2 px-3 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon)}
                    className="bg-red-900 hover:bg-red-800 text-red-200 py-2 px-3 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full bg-gray-700 text-white py-2 px-3 rounded-lg border border-gray-600 focus:border-yellow-400 outline-none"
                    placeholder="DESCUENTO10"
                  />
                  {formErrors.code && <p className="text-red-400 text-sm mt-1">{formErrors.code}</p>}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-700 text-white py-2 px-3 rounded-lg border border-gray-600 focus:border-yellow-400 outline-none"
                    placeholder="Descuento 10%"
                  />
                  {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-700 text-white py-2 px-3 rounded-lg border border-gray-600 focus:border-yellow-400 outline-none"
                  rows={3}
                  placeholder="Descripción del cupón..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'percentage' | 'fixed'})}
                    className="w-full bg-gray-700 text-white py-2 px-3 rounded-lg border border-gray-600 focus:border-yellow-400 outline-none"
                  >
                    <option value="percentage">Porcentaje</option>
                    <option value="fixed">Monto Fijo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Valor * {formData.type === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                    className="w-full bg-gray-700 text-white py-2 px-3 rounded-lg border border-gray-600 focus:border-yellow-400 outline-none"
                    min="0"
                    max={formData.type === 'percentage' ? "100" : undefined}
                    step={formData.type === 'percentage' ? "1" : "100"}
                  />
                  {formErrors.value && <p className="text-red-400 text-sm mt-1">{formErrors.value}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Monto Mínimo del Pedido ($)
                  </label>
                  <input
                    type="number"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({...formData, min_order_amount: parseFloat(e.target.value) || 0})}
                    className="w-full bg-gray-700 text-white py-2 px-3 rounded-lg border border-gray-600 focus:border-yellow-400 outline-none"
                    min="0"
                    step="100"
                  />
                  {formErrors.min_order_amount && <p className="text-red-400 text-sm mt-1">{formErrors.min_order_amount}</p>}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Descuento Máximo ($) - Opcional
                  </label>
                  <input
                    type="number"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({...formData, max_discount_amount: e.target.value})}
                    className="w-full bg-gray-700 text-white py-2 px-3 rounded-lg border border-gray-600 focus:border-yellow-400 outline-none"
                    min="0"
                    step="100"
                    placeholder="Sin límite"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Límite de Usos - Opcional
                  </label>
                  <input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                    className="w-full bg-gray-700 text-white py-2 px-3 rounded-lg border border-gray-600 focus:border-yellow-400 outline-none"
                    min="1"
                    placeholder="Ilimitado"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full bg-gray-700 text-white py-2 px-3 rounded-lg border border-gray-600 focus:border-yellow-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Fecha de Fin - Opcional
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full bg-gray-700 text-white py-2 px-3 rounded-lg border border-gray-600 focus:border-yellow-400 outline-none"
                    min={formData.start_date}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400"
                />
                <label htmlFor="is_active" className="text-gray-300 text-sm">
                  Cupón activo
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitLoading ? 'Guardando...' : (editingCoupon ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
