import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, DollarSign, Percent, Save, X } from 'lucide-react';

interface Comuna {
  id: string;
  name: string;
  isActive: boolean;
  deliveryPrice: number;
  estimatedTime: string;
}

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  expirationDate?: string;
  minOrderAmount?: number;
}

const DeliveryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comunas' | 'cupones'>('comunas');
  
  // Estados para comunas - Todas las comunas de Santiago
  const [comunas, setComunas] = useState<Comuna[]>([
    { id: '1', name: 'Cerrillos', isActive: false, deliveryPrice: 3000, estimatedTime: '45-60 min' },
    { id: '2', name: 'Cerro Navia', isActive: false, deliveryPrice: 4000, estimatedTime: '60-75 min' },
    { id: '3', name: 'Conchalí', isActive: false, deliveryPrice: 3500, estimatedTime: '45-60 min' },
    { id: '4', name: 'El Bosque', isActive: false, deliveryPrice: 4000, estimatedTime: '60-75 min' },
    { id: '5', name: 'Estación Central', isActive: true, deliveryPrice: 2000, estimatedTime: '30-45 min' },
    { id: '6', name: 'Huechuraba', isActive: false, deliveryPrice: 3500, estimatedTime: '45-60 min' },
    { id: '7', name: 'Independencia', isActive: true, deliveryPrice: 2500, estimatedTime: '30-45 min' },
    { id: '8', name: 'La Cisterna', isActive: false, deliveryPrice: 3000, estimatedTime: '45-60 min' },
    { id: '9', name: 'La Florida', isActive: false, deliveryPrice: 4500, estimatedTime: '60-75 min' },
    { id: '10', name: 'La Granja', isActive: false, deliveryPrice: 4500, estimatedTime: '60-75 min' },
    { id: '11', name: 'La Pintana', isActive: false, deliveryPrice: 5000, estimatedTime: '75-90 min' },
    { id: '12', name: 'La Reina', isActive: true, deliveryPrice: 2000, estimatedTime: '45-60 min' },
    { id: '13', name: 'Las Condes', isActive: true, deliveryPrice: 0, estimatedTime: '30-45 min' },
    { id: '14', name: 'Lo Barnechea', isActive: false, deliveryPrice: 5000, estimatedTime: '60-90 min' },
    { id: '15', name: 'Lo Espejo', isActive: false, deliveryPrice: 3500, estimatedTime: '45-60 min' },
    { id: '16', name: 'Lo Prado', isActive: false, deliveryPrice: 4000, estimatedTime: '60-75 min' },
    { id: '17', name: 'Macul', isActive: true, deliveryPrice: 3000, estimatedTime: '45-60 min' },
    { id: '18', name: 'Maipú', isActive: false, deliveryPrice: 4000, estimatedTime: '60-75 min' },
    { id: '19', name: 'Ñuñoa', isActive: true, deliveryPrice: 0, estimatedTime: '30-45 min' },
    { id: '20', name: 'Pedro Aguirre Cerda', isActive: false, deliveryPrice: 3500, estimatedTime: '45-60 min' },
    { id: '21', name: 'Peñalolén', isActive: false, deliveryPrice: 4000, estimatedTime: '60-75 min' },
    { id: '22', name: 'Providencia', isActive: true, deliveryPrice: 0, estimatedTime: '30-45 min' },
    { id: '23', name: 'Pudahuel', isActive: false, deliveryPrice: 4500, estimatedTime: '60-75 min' },
    { id: '24', name: 'Quilicura', isActive: false, deliveryPrice: 4000, estimatedTime: '60-75 min' },
    { id: '25', name: 'Quinta Normal', isActive: false, deliveryPrice: 3000, estimatedTime: '45-60 min' },
    { id: '26', name: 'Recoleta', isActive: true, deliveryPrice: 2000, estimatedTime: '30-45 min' },
    { id: '27', name: 'Renca', isActive: false, deliveryPrice: 3500, estimatedTime: '45-60 min' },
    { id: '28', name: 'San Joaquín', isActive: true, deliveryPrice: 2500, estimatedTime: '30-45 min' },
    { id: '29', name: 'San Miguel', isActive: true, deliveryPrice: 2500, estimatedTime: '30-45 min' },
    { id: '30', name: 'San Ramón', isActive: false, deliveryPrice: 4000, estimatedTime: '60-75 min' },
    { id: '31', name: 'Santiago', isActive: true, deliveryPrice: 0, estimatedTime: '30-45 min' },
    { id: '32', name: 'Vitacura', isActive: true, deliveryPrice: 2000, estimatedTime: '45-60 min' },
  ]);

  // Estados para cupones
  const [cupones, setCupones] = useState<Coupon[]>([
    {
      id: '1',
      code: 'NUEVO10',
      description: 'Descuento para nuevos clientes',
      discountType: 'percentage',
      discountValue: 10,
      isActive: true,
      minOrderAmount: 20000
    },
    {
      id: '2',
      code: 'DESCUENTO5000',
      description: 'Descuento fijo de $5,000',
      discountType: 'fixed',
      discountValue: 5000,
      isActive: true,
      minOrderAmount: 30000
    },
    {
      id: '3',
      code: 'PROMO15',
      description: 'Promoción especial 15%',
      discountType: 'percentage',
      discountValue: 15,
      isActive: false,
      expirationDate: '2024-12-31'
    }
  ]);
  
  const [editingComuna, setEditingComuna] = useState<Comuna | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    isActive: true
  });

  const toggleComunaStatus = (id: string) => {
    setComunas(prev => prev.map(comuna => 
      comuna.id === id ? { ...comuna, isActive: !comuna.isActive } : comuna
    ));
  };

  const updateComunaDelivery = (id: string, deliveryPrice: number, estimatedTime: string) => {
    setComunas(prev => prev.map(comuna => 
      comuna.id === id ? { ...comuna, deliveryPrice, estimatedTime } : comuna
    ));
    setEditingComuna(null);
  };

  const toggleCouponStatus = (id: string) => {
    setCupones(prev => prev.map(coupon => 
      coupon.id === id ? { ...coupon, isActive: !coupon.isActive } : coupon
    ));
  };

  const deleteCoupon = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cupón?')) {
      setCupones(prev => prev.filter(coupon => coupon.id !== id));
    }
  };

  const addCoupon = () => {
    if (newCoupon.code && newCoupon.description && newCoupon.discountValue) {
      const coupon: Coupon = {
        id: Date.now().toString(),
        code: newCoupon.code.toUpperCase(),
        description: newCoupon.description,
        discountType: newCoupon.discountType || 'percentage',
        discountValue: newCoupon.discountValue,
        isActive: newCoupon.isActive || true,
        expirationDate: newCoupon.expirationDate,
        minOrderAmount: newCoupon.minOrderAmount
      };
      setCupones(prev => [...prev, coupon]);
      setNewCoupon({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        isActive: true
      });
      setShowCouponModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gestión de Entregas</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('comunas')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'comunas'
              ? 'bg-yellow-400 text-black font-semibold'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <MapPin className="inline mr-2" size={16} />
          Comunas y Precios
        </button>
        <button
          onClick={() => setActiveTab('cupones')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'cupones'
              ? 'bg-yellow-400 text-black font-semibold'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Percent className="inline mr-2" size={16} />
          Cupones de Descuento
        </button>
      </div>

      {/* Contenido de Comunas */}
      {activeTab === 'comunas' && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Gestión de Comunas</h2>
          <p className="text-gray-400 mb-6">Configura qué comunas están disponibles para entrega y sus precios</p>
          
          <div className="grid gap-4">
            {comunas.map((comuna) => (
              <div key={comuna.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{comuna.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-300">
                        <span>Precio: ${comuna.deliveryPrice.toLocaleString()}</span>
                        <span>Tiempo: {comuna.estimatedTime}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          comuna.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {comuna.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingComuna(comuna)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => toggleComunaStatus(comuna.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        comuna.isActive 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      title={comuna.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {comuna.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
                
                {editingComuna?.id === comuna.id && (
                  <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Precio de Entrega
                        </label>
                        <input
                          type="number"
                          defaultValue={comuna.deliveryPrice}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          id={`price-${comuna.id}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Tiempo Estimado
                        </label>
                        <input
                          type="text"
                          defaultValue={comuna.estimatedTime}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          id={`time-${comuna.id}`}
                          placeholder="ej: 30-45 min"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => setEditingComuna(null)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          const priceInput = document.getElementById(`price-${comuna.id}`) as HTMLInputElement;
                          const timeInput = document.getElementById(`time-${comuna.id}`) as HTMLInputElement;
                          updateComunaDelivery(comuna.id, parseInt(priceInput.value) || 0, timeInput.value);
                        }}
                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenido de Cupones */}
      {activeTab === 'cupones' && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Gestión de Cupones</h2>
            <button
              onClick={() => setShowCouponModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus className="mr-2" size={16} />
              Nuevo Cupón
            </button>
          </div>
          <p className="text-gray-400 mb-6">Configura los cupones de descuento disponibles</p>
          
          <div className="grid gap-4">
            {cupones.map((coupon) => (
              <div key={coupon.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{coupon.code}</h3>
                    <p className="text-gray-300 text-sm">{coupon.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      <span>
                        Descuento: {coupon.discountType === 'percentage' 
                          ? `${coupon.discountValue}%` 
                          : `$${coupon.discountValue.toLocaleString()}`}
                      </span>
                      {coupon.minOrderAmount && (
                        <span>Mínimo: ${coupon.minOrderAmount.toLocaleString()}</span>
                      )}
                      {coupon.expirationDate && (
                        <span>Expira: {coupon.expirationDate}</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        coupon.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {coupon.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleCouponStatus(coupon.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        coupon.isActive 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      title={coupon.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {coupon.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para nuevo cupón */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Nuevo Cupón</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Código del Cupón
                </label>
                <input
                  type="text"
                  value={newCoupon.code || ''}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="ej: DESCUENTO20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={newCoupon.description || ''}
                  onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Descripción del cupón"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo de Descuento
                </label>
                <select
                  value={newCoupon.discountType || 'percentage'}
                  onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value as 'percentage' | 'fixed'})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo ($)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Valor del Descuento
                </label>
                <input
                  type="number"
                  value={newCoupon.discountValue || ''}
                  onChange={(e) => setNewCoupon({...newCoupon, discountValue: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder={newCoupon.discountType === 'percentage' ? 'ej: 20' : 'ej: 5000'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Monto Mínimo de Pedido (opcional)
                </label>
                <input
                  type="number"
                  value={newCoupon.minOrderAmount || ''}
                  onChange={(e) => setNewCoupon({...newCoupon, minOrderAmount: parseFloat(e.target.value) || undefined})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="ej: 20000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fecha de Expiración (opcional)
                </label>
                <input
                  type="date"
                  value={newCoupon.expirationDate || ''}
                  onChange={(e) => setNewCoupon({...newCoupon, expirationDate: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={() => setShowCouponModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addCoupon}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors"
              >
                Crear Cupón
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagement;