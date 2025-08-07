import React from 'react';
import { ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';
import { View } from '../App';
import { useCart } from '../context/CartContext';

interface CartProps {
  onViewChange: (view: View) => void;
}

const Cart: React.FC<CartProps> = ({ onViewChange }) => {
  const { items, updateQuantity, removeFromCart, getTotal } = useCart();

  // Quitar el deliveryFee fijo
  // const deliveryFee = 2500;
  // const total = getTotal() + deliveryFee;
  const subtotal = getTotal();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => onViewChange('home')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver al inicio</span>
          </button>
        </div>
        
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-white mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-400 mb-8">Agrega algunos productos deliciosos</p>
          <button
            onClick={() => onViewChange('home')}
            className="bg-yellow-400 text-black font-semibold py-3 px-6 rounded-lg hover:bg-yellow-300 transition-colors"
          >
            Ir de compras
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => onViewChange('home')}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mr-4"
        >
          <ArrowLeft size={20} />
          <span>Continuar comprando</span>
        </button>
        <h1 className="text-3xl font-bold text-white">Carrito de Compras</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-3 md:space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg mb-3 sm:mb-0"
                  />
                  <div className="flex-1 mb-3 sm:mb-0">
                    <h3 className="text-base md:text-lg font-semibold text-white">{item.name}</h3>
                    <p className="text-yellow-400 font-semibold text-sm md:text-base">
                      ${item.price.toLocaleString()}/kg
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(0.1, item.quantity - 0.1))}
                      className="bg-gray-700 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                    >
                      -
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseFloat(e.target.value) || 0;
                          if (newQuantity >= 0.1) {
                            updateQuantity(item.id, newQuantity);
                          }
                        }}
                        onBlur={(e) => {
                          const newQuantity = parseFloat(e.target.value) || 0.1;
                          if (newQuantity < 0.1) {
                            updateQuantity(item.id, 0.1);
                          }
                        }}
                        min="0.1"
                        step="0.1"
                        className="w-16 bg-gray-800 text-white text-center py-1 px-2 rounded border border-gray-600 focus:border-yellow-400 outline-none"
                      />
                      <span className="text-gray-400 text-sm">kg</span>
                    </div>
                    
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 0.1)}
                      className="bg-gray-700 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right flex flex-row sm:flex-col justify-between w-full sm:w-auto items-center sm:items-end">
                    <p className="text-base md:text-lg font-bold text-white">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 active:text-red-200 sm:mt-2"
                      aria-label="Eliminar del carrito"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-800 sticky top-24 shadow-xl">
            <h2 className="text-lg md:text-xl font-bold text-white mb-4">Resumen del Pedido</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm md:text-base">Subtotal</span>
                <span className="text-white text-sm md:text-base">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm md:text-base">Despacho a domicilio</span>
                <span className="text-yellow-400 text-sm md:text-base">Según comuna</span>
              </div>
              <hr className="border-gray-700" />
              <div className="flex justify-between">
                <span className="text-white font-bold text-sm md:text-base">Subtotal</span>
                <span className="text-yellow-400 font-bold text-lg md:text-xl">${subtotal.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">*El costo de envío se calculará según la comuna seleccionada</p>
            </div>

            <button
              onClick={() => onViewChange('checkout')}
              className="w-full bg-yellow-400 text-black font-semibold py-2 md:py-3 rounded-lg hover:bg-yellow-300 active:bg-yellow-200 transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
            >
              <span>Proceder al Pedido</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;