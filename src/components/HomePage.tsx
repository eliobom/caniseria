import React, { useEffect, useState, useMemo } from 'react';
import { View } from '../App';
import { getCategories, getDailyOffers } from '../services/supabaseService';
import { useCart } from '../context/CartContext';
import { useSystemConfig } from '../hooks/useSystemConfig';
import InfoBar from './InfoBar';
import SantiagoMap from './SantiagoMap';
import Footer from './Footer';
import { Tag, Clock } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

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
  const { config, loading: configLoading } = useSystemConfig();

  // Valores seguros derivados de configuración para evitar errores de render
  const heroTitle: string = typeof config?.hero_title === 'string' ? config.hero_title : '';
  const heroSubtitle: string = typeof config?.hero_subtitle === 'string' ? config.hero_subtitle : '';
  const safeHeroTitle: string = heroTitle && typeof heroTitle === 'string' ? heroTitle : 'Carnicería Premium';
  const safeHeroSubtitle: string = heroSubtitle && typeof heroSubtitle === 'string' ? heroSubtitle : 'Las mejores carnes frescas, seleccionadas especialmente para tu mesa. Calidad premium, servicio excepcional.';
  const offersTitle: string = typeof config?.offers_section_title === 'string' ? config.offers_section_title : '';
  const categoriesTitle: string = typeof config?.categories_section_title === 'string' ? config.categories_section_title : '';
  // Evitar cualquier operación compleja en render para el Héroe
  // const heroWords = heroTitle && typeof heroTitle.split === 'function' ? heroTitle.split(' ') : [];

  // Parsing robusto de banderas booleanas de configuración
  const parseBool = (v: unknown): boolean | undefined => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (['true', '1', 'yes', 'si', 'sí', 'on', 'enabled', 'activo', 'activado'].includes(s)) return true;
      if (['false', '0', 'no', 'off', 'disabled', 'inactivo', 'desactivado'].includes(s)) return false;
    }
    return undefined;
  };

  const showHero = parseBool((config as any)?.hero_enabled
    ?? (config as any)?.show_hero
    ?? (config as any)?.heroe_activo
    ?? (config as any)?.mostrar_hero) ?? true;
  const showHeroSubtitle = parseBool((config as any)?.hero_show_subtitle
    ?? (config as any)?.show_description
    ?? (config as any)?.descripcion_visible
    ?? (config as any)?.mostrar_descripcion
    ?? (config as any)?.mostrar_subtitulo) ?? true;
  const showOffers = parseBool((config as any)?.offers_enabled
    ?? (config as any)?.show_offers
    ?? (config as any)?.ofertas_visibles
    ?? (config as any)?.mostrar_ofertas) ?? true;
  const showCategories = parseBool((config as any)?.categories_enabled
    ?? (config as any)?.show_categories
    ?? (config as any)?.categorias_visibles
    ?? (config as any)?.mostrar_categorias) ?? true;
  const showMap = parseBool((config as any)?.map_enabled
    ?? (config as any)?.show_map
    ?? (config as any)?.show_locations
    ?? (config as any)?.mostrar_mapa
    ?? (config as any)?.mostrar_locales) ?? true;

  // Diagnóstico ligero para detectar configuraciones inesperadas
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // Solo en dev
      // eslint-disable-next-line no-console
      console.log('[HomePage] config snapshot', {
        types: {
          hero_title: typeof config?.hero_title,
          hero_subtitle: typeof config?.hero_subtitle,
          offers_section_title: typeof config?.offers_section_title,
          categories_section_title: typeof config?.categories_section_title,
        },
        flags: { showHero, showHeroSubtitle, showOffers, showCategories, showMap }
      });
    }
  }, [config]);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedCategories = await getCategories();
      const safeCategories = Array.isArray(fetchedCategories) ? fetchedCategories : [];
      setCategories(safeCategories);
      
      try {
        const activeOffers = await getDailyOffers();
        const safeOffers = Array.isArray(activeOffers) ? activeOffers : [];
        setDailyOffers(safeOffers);
      } catch (error) {
        console.error('Error fetching daily offers:', error);
        setDailyOffers([]);
      }
    };
    fetchData();
  }, []);
  
  // Sanitización no destructiva para render
  const safeDailyOffers = (Array.isArray(dailyOffers) ? dailyOffers : []).map((p, i) => ({
    id: String((p as any)?.id ?? `offer-${i}`),
    name: String((p as any)?.name ?? 'Producto'),
    description: String((p as any)?.description ?? ''),
    price: Number.isFinite(Number((p as any)?.price)) ? Number((p as any)?.price) : 0,
    image: String((p as any)?.image ?? ''),
    category_id: String((p as any)?.category_id ?? ''),
    stock: Number.isFinite(Number((p as any)?.stock)) ? Number((p as any)?.stock) : 0,
  }));
  const safeCategories = (Array.isArray(categories) ? categories : [])
    .filter(c => (c as any)?.is_visible !== false)
    .map((c, i) => ({
      id: String((c as any)?.id ?? `cat-${i}`),
      name: String((c as any)?.name ?? 'Categoría'),
      description: String((c as any)?.description ?? ''),
      image: String((c as any)?.image ?? ''),
      order: Number.isFinite(Number((c as any)?.order)) ? Number((c as any)?.order) : i,
      is_visible: (c as any)?.is_visible !== false,
    }))
    .sort((a, b) => a.order - b.order);
  
  return (
    <ErrorBoundary>
      {/* InfoBar está fuera para que si falla el contenido principal, la barra no rompa */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {showHero && (
          <ErrorBoundary label="Home-Hero" fallback={<div className="bg-red-900/20 border border-red-700 text-red-300 rounded-lg p-4 mb-6">Sección Hero falló al renderizar.</div>}>
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-3 md:mb-4">
                {safeHeroTitle}
              </h1>
              {showHeroSubtitle && (
                <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
                  {safeHeroSubtitle}
                </p>
              )}
            </div>
          </ErrorBoundary>
        )}


        {/* Ofertas del día */}
        {showOffers && (
        <ErrorBoundary label="Home-Offers" fallback={<div className="bg-red-900/20 border border-red-700 text-red-300 rounded-lg p-4 mb-6">Sección Ofertas falló al renderizar.</div>}>
          <div className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-yellow-400/20">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center">
                <Tag className="text-yellow-400 mr-2 md:mr-3" size={24} />
                <h3 className="text-xl md:text-2xl font-bold text-white">Ofertas del día</h3>
              </div>
              <Clock className="text-yellow-400 ml-2" size={28} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {safeDailyOffers.map((product) => (
                <div key={product.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-yellow-400/30 relative">
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                    OFERTA
                  </div>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-48 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                    <p className="text-gray-300 text-sm mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-yellow-400">${product.price.toLocaleString('es-CL')}</span>
                      <button 
                        onClick={() => addToCart({ ...product, quantity: 1 })}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-semibold transition-colors"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ErrorBoundary>
        )}

        {/* Cuadrícula de categorías */}
        {showCategories && (
          <ErrorBoundary
            label="Home-Categories"
            fallback={
              <div className="bg-red-900/20 border border-red-700 text-red-300 rounded-lg p-4 mb-6">
                Sección Categorías falló al renderizar.
              </div>
            }
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">
              {categoriesTitle || 'Nuestras Categorías'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {safeCategories.map((category) => (
                <div
                  key={category.id} 
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => onCategorySelect(category.id)}
                >
                  <div className="overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{category.name}</h3>
                    <p className="text-gray-300 text-sm">{category.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ErrorBoundary>
        )}

        {/* Mapa de Locales */}
        {showMap && (
        <ErrorBoundary label="Home-Map" fallback={<div className="bg-red-900/20 border border-red-700 text-red-300 rounded-lg p-4 mb-6">Sección Mapa falló al renderizar.</div>}>
          <div className="mt-12 md:mt-16">
            <SantiagoMap />
          </div>
        </ErrorBoundary>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </ErrorBoundary>
  );
};

export default HomePage;