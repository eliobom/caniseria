import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartNotificationProps {
  onNavigateToCart: () => void;
}

const CartNotification: React.FC<CartNotificationProps> = ({ onNavigateToCart }) => {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  if (itemCount === 0) return null;

  return (
    <button
      onClick={onNavigateToCart}
      className="fixed bottom-6 right-6 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50 flex items-center justify-center"
      title={`${itemCount} productos en el carrito`}
    >
      <div className="relative">
        <ShoppingCart size={24} />
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
          {itemCount}
        </span>
      </div>
    </button>
  );
};

export default CartNotification;