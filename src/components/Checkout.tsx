import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { View } from '../App';
import { useCart, CartItem } from '../context/CartContext';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { santiagoCommunas, comunasData } from '../data/comunas';
import { 
  createCustomer, 
  updateCustomer, 
  createOrder, 
  getCustomerByPhone, 
  validateCoupon, 
  useCoupon,
  getConfigurationByKey
} from '../services/supabaseService';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  commune: string;
  total_orders: number;
  total_spent: number;
  last_order: string;
  join_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CheckoutProps {
  onViewChange: (view: View) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onViewChange }) => {
  const { items, getTotal, clearCart } = useCart();
  const { config, loading: configLoading } = useSystemConfig();
  const total = getTotal();
  const [customerCode, setCustomerCode] = useState('');
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [customerFound, setCustomerFound] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('+56912345678');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: string;
    clientCode: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    commune: string;
    items: CartItem[];
    total: number;
    originalTotal: number;
    discount: number;
    couponCode?: string;
    estimatedDelivery: string;
    orderDate: string;
    orderTime: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string>('');
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; value: number; type: 'percentage' | 'fixed'; couponId?: string} | null>(null);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('45-60 minutos');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    commune: ''
  });

  useEffect(() => {
    const fetchWhatsappNumber = async () => {
      try {
        const whatsappConfig = await getConfigurationByKey('whatsapp_number');
        if (whatsappConfig && whatsappConfig.value) {
          setWhatsappNumber(whatsappConfig.value);
        }
      } catch (error) {
        console.error('Error fetching WhatsApp number:', error);
      }
    };
    fetchWhatsappNumber();
  }, []);

  const handleCustomerCodeSearch = async () => {
    if (!customerCode.trim()) return;
    setIsLoadingCustomer(true);
    try {
      const customer = await getCustomerByPhone(customerCode);
      if (customer) {
        setCustomerFound(customer);
        setFormData({
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          commune: customer.commune || ''
        });
      } else {
        alert('Cliente no encontrado. Verifica el código o completa los datos manualmente.');
      }
    } catch (error) {
      console.error('Error buscando cliente:', error);
      alert('Error al buscar cliente.');
    } finally {
      setIsLoadingCustomer(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setSubmitError('');
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push('El nombre es requerido');
    if (!formData.phone.trim()) errors.push('El teléfono es requerido');
    if (!formData.address.trim()) errors.push('La dirección es requerida');
    if (!formData.commune) errors.push('Debes seleccionar una comuna');
    if (items.length === 0) errors.push('Tu carrito está vacío');
    
    if (errors.length > 0) {
      setSubmitError(errors.join('. '));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
      const orderId = `KT-${dateStr}-${timeStr.substring(0, 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      let savedCustomer = customerFound;
      
      if (!savedCustomer && formData.phone) {
        try {
          const existingCustomer = await getCustomerByPhone(formData.phone);
          if (existingCustomer) {
            savedCustomer = existingCustomer;
            await updateCustomer(existingCustomer.id, {
              name: formData.name,
              email: formData.email || '',
              address: formData.address,
              commune: formData.commune
            });
          } else {
            const newCustomer = await createCustomer({
              name: formData.name,
              email: formData.email || '',
              phone: formData.phone,
              address: formData.address,
              commune: formData.commune
            });
            if (newCustomer) savedCustomer = newCustomer;
          }
        } catch (customerError) {
          console.warn('Error managing customer:', customerError);
        }
      }
      
      const finalTotal = getFinalTotal();
      const discount = calculateDiscount();
      
      const orderData = {
        id: orderId,
        customerId: savedCustomer?.id,
        customerName: formData.name,
        customerEmail: formData.email || null,
        customerPhone: formData.phone,
        address: formData.address,
        commune: formData.commune,
        status: 'pendiente',
        total: finalTotal,
        originalTotal: total,
        discount: discount,
        couponCode: appliedCoupon?.code || null,
        estimatedDelivery: estimatedDeliveryTime,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const createdOrder = await createOrder(orderData);
      
      if (appliedCoupon && appliedCoupon.couponId) {
        try {
          await useCoupon(
            appliedCoupon.code,
            orderId,
            savedCustomer?.id || null,
            discount
          );
        } catch (couponError) {
          console.error('Error registering coupon usage:', couponError);
          // No fallar el pedido por esto, solo registrar el error
        }
      }
      
      if (createdOrder) {
        clearCart();
        
        const namePart = formData.name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
        const phonePart = formData.phone.slice(-4);
        const clientCode = `${namePart}${phonePart}`;
        
        const orderInfo = {
          id: orderId,
          clientCode,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          commune: formData.commune,
          items: [...items],
          total: finalTotal,
          originalTotal: total,
          discount: discount,
          couponCode: appliedCoupon?.code,
          estimatedDelivery: estimatedDeliveryTime,
          orderDate: now.toLocaleDateString('es-CL'),
          orderTime: now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
        };
        
        setConfirmedOrder(orderInfo);
        setOrderConfirmed(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('No se recibió confirmación del pedido');
      }
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setSubmitError(`Error al procesar el pedido: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setMessage({ type: 'error', text: 'Ingresa un código de cupón' });
      return;
    }
    
    try {
      const result = await validateCoupon(couponCode.trim(), total);
      
      if (result.valid) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          type: 'fixed', // Se usa el monto calculado por la función SQL
          value: result.discountAmount,
          couponId: result.couponId
        });
        setCouponCode('');
        setMessage({ type: 'success', text: 'Cupón aplicado exitosamente' });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setMessage({ type: 'error', text: 'Error al validar el cupón' });
    }
  };
  
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setMessage(null);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    if (appliedCoupon.type === 'percentage') {
      return Math.round(total * (appliedCoupon.value / 100));
    }
    return appliedCoupon.value;
  };

  const getFinalTotal = () => {
    return total - calculateDiscount() + getDeliveryPrice(formData.commune);
  };

  // Usar configuraciones dinámicas
  const shippingCost = parseInt(config.shipping_cost || '3000');
  const minimumOrder = parseInt(config.minimum_order || '20000');
  const confirmationMessage = config.confirmation_message || 'Gracias por tu pedido.';
  const deliveryTime = config.delivery_time || '24-48 horas';
  const availableCommunes = config.available_communes || [];

  // Función para calcular precio de delivery
  const getDeliveryPrice = (commune: string) => {
    // Primero verificar si la comuna está en las disponibles
    if (availableCommunes.length > 0 && !availableCommunes.includes(commune)) {
      return 0; // No hay delivery disponible
    }
    
    // Usar datos de comunas o costo por defecto
    const comunaData = comunasData.find(c => c.name === commune);
    return comunaData ? comunaData.deliveryPrice : shippingCost;
  };

  // Función para calcular tiempo de delivery
  const calculateDeliveryTime = (commune: string) => {
    const comunaData = comunasData.find(c => c.name === commune);
    if (comunaData && comunaData.deliveryTime) {
      return comunaData.deliveryTime;
    }
    return deliveryTime;
  };

  // Validación de pedido mínimo
  const isOrderValid = () => {
    const finalTotal = getFinalTotal();
    return finalTotal >= minimumOrder;
  };

  useEffect(() => {
    if (formData.commune) {
      setEstimatedDeliveryTime(calculateDeliveryTime(formData.commune));
    }
  }, [formData.commune, deliveryTime]);

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {orderConfirmed && confirmedOrder ? (
          <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-600 rounded-xl p-8 mb-6 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-300">¡Pedido Confirmado Exitosamente!</h2>
                <p className="text-green-200 text-sm mt-1">Tu pedido ha sido procesado correctamente</p>
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-1">Número de Pedido</p>
                  <p className="text-yellow-400 font-mono text-lg font-bold">{confirmedOrder.id}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-1">Código de Cliente</p>
                  <p className="text-yellow-400 font-mono text-lg font-bold">{confirmedOrder.clientCode}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-1">Fecha y Hora</p>
                  <p className="text-white text-sm">{confirmedOrder.orderDate}</p>
                  <p className="text-white text-sm">{confirmedOrder.orderTime}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=¡Hola! 👋%0A%0AHe realizado un pedido en KATE:%0A%0A📋 *Pedido:* ${confirmedOrder.id}%0A👤 *Cliente:* ${confirmedOrder.name}%0A📱 *Código:* ${confirmedOrder.clientCode}%0A💰 *Total:* $${confirmedOrder.total.toLocaleString()}%0A📍 *Dirección:* ${confirmedOrder.address}, ${confirmedOrder.commune}%0A⏰ *Tiempo estimado:* ${confirmedOrder.estimatedDelivery}%0A%0A¿Podrían confirmar que el pedido está en proceso? ¡Gracias!`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-center flex items-center justify-center gap-2 shadow-lg"
              >
                <span>📱</span>
                Contactar por WhatsApp
              </a>
              <button
                onClick={() => {
                  setOrderConfirmed(false);
                  setConfirmedOrder(null);
                  onViewChange('home');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span>🏠</span>
                Volver al Inicio
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-6 sm:mb-8">
              <button
                onClick={() => onViewChange('cart')}
                className="mr-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold">Finalizar Compra</h1>
            </div>

            {submitError && (
              <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <p className="text-red-200 text-sm">{submitError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                      placeholder="Tu número de teléfono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Comuna *
                    </label>
                    <select
                      name="commune"
                      value={formData.commune}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                      required
                    >
                      <option value="">Selecciona tu comuna</option>
                      {santiagoCommunas.map((commune) => (
                        <option key={commune} value={commune}>
                          {commune}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                      placeholder="Tu dirección completa"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
                
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-400 text-sm">{item.quantity}kg × ${item.price.toLocaleString()}</p>
                      </div>
                      <p className="font-medium">${(item.quantity * item.price).toLocaleString()}</p>
                    </div>
                  ))}
                  
                  <hr className="border-gray-700" />
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Subtotal</span>
                    <span className="text-white">${total.toLocaleString()}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-400">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span>-${calculateDiscount().toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Despacho{formData.commune ? ` (${formData.commune})` : ''}</span>
                    <span className={getDeliveryPrice(formData.commune) === 0 ? "text-green-400" : "text-white"}>
                      {getDeliveryPrice(formData.commune) === 0 ? 'Gratis' : `$${getDeliveryPrice(formData.commune).toLocaleString()}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-yellow-400">${getFinalTotal().toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Sección de Cupón */}
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold mb-3">Cupón de Descuento</h3>
                  
                  {/* Mostrar mensaje de validación */}
                  {message && (
                    <div className={`p-3 rounded-lg mb-3 ${
                      message.type === 'success' 
                        ? 'bg-green-900 border border-green-600 text-green-200' 
                        : 'bg-red-900 border border-red-600 text-red-200'
                    }`}>
                      {message.text}
                    </div>
                  )}
                  
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Código de cupón"
                        className="flex-1 bg-gray-800 text-white py-2 px-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                        onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-900 border border-green-600 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 font-semibold">{appliedCoupon.code}</span>
                        <span className="text-green-200">aplicado</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-red-400 hover:text-red-300 font-semibold"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => onViewChange('cart')}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Procesando Pedido...
                    </span>
                  ) : (
                    'Confirmar Pedido'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
