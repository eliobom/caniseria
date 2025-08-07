import React, { useEffect, useState, useMemo } from 'react';
import { View } from '../App';
import { getCategories, getDailyOffers } from '../services/supabaseService';
import { useCart } from '../context/CartContext';
import InfoBar from './InfoBar';
import SantiagoMap from './SantiagoMap';
import { Tag, Clock } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  order: number;
  is_visible?: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
  stock: number;
  is_visible?: boolean;
  originalPrice?: number;
  discount_percentage?: number;
  offer_id?: string;
}

interface HomePageProps {
  onCategorySelect: (categoryId: string) => void;
  onViewChange: (view: View) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dailyOffers, setDailyOffers] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories || []);
      
      try {
        const activeOffers = await getDailyOffers();
        setDailyOffers(activeOffers || []);
      } catch (error) {
        console.error('Error fetching daily offers:', error);
        setDailyOffers([]);
      }
    };
    fetchData();
  }, []);
  
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-3 md:mb-4">
            Carnicería <span className="text-yellow-400">Premium</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Las mejores carnes frescas, seleccionadas especialmente para tu mesa. 
            Calidad premium, servicio excepcional.
          </p>
        </div>

        {/* Ofertas del Día */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-center justify-center mb-6 md:mb-8">
            <Tag className="text-yellow-400 mr-2" size={28} />
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white">
              Ofertas del Día
            </h2>
            <Clock className="text-yellow-400 ml-2" size={28} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {dailyOffers.map((product) => (
              <div key={product.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-yellow-400/30 relative">
                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                  OFERTA
                </div>
                <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold z-10">
                  -20%
                </div>
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm line-through">${(product.price * 1.25).toLocaleString()}</span>
                      <span className="text-yellow-400 font-bold text-lg">${product.price.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => addToCart({ ...product, quantity: 1 })}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-white">
            Nuestras Categorías
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {categories
              .filter(category => category.is_visible !== false)
              .sort((a, b) => a.order - b.order)
              .map((category) => (
                <div 
                  key={category.id} 
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => onCategorySelect(category.id)}
                >
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-300">{category.description}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Mapa de Santiago */}
        <div className="mb-12 md:mb-16">
          <SantiagoMap />
        </div>
      </div>
      {/* Remover esta línea: <InfoBar /> */}
    </>
  );
};

export default React.memo(HomePage);