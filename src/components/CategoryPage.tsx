import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { View } from '../App';
import { useCart } from '../context/CartContext';
import { getCategories, getProductsByCategory } from '../services/supabaseService';

interface CategoryPageProps {
  categoryId: string;
  onBack: () => void;
  onViewChange: (view: View) => void;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ categoryId, onBack }) => {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>('1.0');
  const [category, setCategory] = useState<any>(null);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener categorías
        const categories = await getCategories();
        const foundCategory = categories.find((c: any) => c.id === categoryId);
        
        if (!foundCategory) {
          setError('Categoría no encontrada');
          return;
        }
        
        setCategory(foundCategory);
        
        // Obtener productos de la categoría
        const products = await getProductsByCategory(categoryId);
        setCategoryProducts(products);
        
      } catch (err) {
        console.error('Error loading category data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Cargando...</div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400 text-xl">{error || 'Categoría no encontrada'}</div>
        </div>
      </div>
    );
  }

  const handleAddToCart = (productId: string) => {
    setSelectedProduct(productId);
  };

  const confirmAddToCart = () => {
    if (selectedProduct) {
      const product = categoryProducts.find((p: any) => p.id === selectedProduct);
      if (product) {
        console.log('Producto a agregar:', product); // Agregar para debug
        console.log('Cantidad:', quantity); // Agregar para debug
        
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: parseFloat(quantity)
        });
        setSelectedProduct(null);
        setQuantity('1.0');
      } else {
        console.error('Producto no encontrado:', selectedProduct);
      }
    }
  };

  const adjustQuantity = (delta: number) => {
    const newQuantity = Math.max(0.1, parseFloat(quantity) + delta);
    setQuantity(newQuantity.toFixed(1));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center mb-8 space-y-4 sm:space-y-0">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mr-4"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{category.name}</h1>
          <p className="text-gray-400 mt-2">{category.description}</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {categoryProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-lg">No hay productos disponibles en esta categoría</div>
          </div>
        ) : (
          categoryProducts.map((product: any) => (
          <div
            key={product.id}
            className="bg-gray-900 rounded-lg overflow-hidden shadow-xl border border-gray-800 hover:border-yellow-400 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] transform"
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 sm:h-40 md:h-48 object-cover"
              />
              <div className="absolute top-2 right-2 bg-yellow-400 text-black font-bold px-2 py-1 rounded-md text-sm">
                ${product.price.toLocaleString()}/kg
              </div>
            </div>
            <div className="p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">{product.name}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
              <button
                onClick={() => handleAddToCart(product.id)}
                className="w-full bg-yellow-400 text-black font-semibold py-2 md:py-3 rounded-lg hover:bg-yellow-300 active:bg-yellow-200 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Agregar al Carrito</span>
                <Plus size={18} />
              </button>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Quantity Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Cantidad en kilogramos</h3>
            
            <div className="flex items-center justify-center mb-6">
              <button
                onClick={() => adjustQuantity(-0.1)}
                className="bg-gray-700 text-white p-3 rounded-l-lg hover:bg-gray-600 active:bg-gray-500 transition-colors"
              >
                <Minus size={20} />
              </button>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-gray-800 text-white text-center py-3 px-4 w-28 border-t border-b border-gray-700 text-lg"
              />
              <button
                onClick={() => adjustQuantity(0.1)}
                className="bg-gray-700 text-white p-3 rounded-r-lg hover:bg-gray-600 active:bg-gray-500 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="text-center text-gray-300 mb-6 text-lg">
              {parseFloat(quantity)} kg
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setSelectedProduct(null)}
                className="sm:flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 active:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAddToCart}
                className="sm:flex-1 bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-300 active:bg-yellow-200 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;