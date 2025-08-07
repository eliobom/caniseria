import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Package, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { getProducts, getProductsByCategory, getCategories, updateProductStock } from '../../services/supabaseService';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  order: number;
}

const InventoryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadProductsByCategory = async (categoryId: string) => {
    setIsLoading(true);
    try {
      if (categoryId === 'all') {
        const productsData = await getProducts();
        setProducts(productsData);
      } else {
        const productsData = await getProductsByCategory(categoryId);
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error cargando productos por categoría:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(product => product.stock <= 5);
  const outOfStockProducts = products.filter(product => product.stock === 0);

  const handleUpdateStock = (product: Product) => {
    setSelectedProduct(product);
    setNewStock(product.stock);
    setShowUpdateModal(true);
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setIsUpdating(true);
    try {
      await updateProductStock(selectedProduct.id, newStock);
      await loadData();
      setShowUpdateModal(false);
      setSelectedProduct(null);
      setNewStock(0);
    } catch (error) {
      console.error('Error actualizando stock:', error);
      alert('Error al actualizar el stock');
    } finally {
      setIsUpdating(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Sin stock', color: 'bg-red-900 text-red-300' };
    if (stock <= 5) return { label: 'Stock bajo', color: 'bg-yellow-900 text-yellow-300' };
    if (stock <= 10) return { label: 'Stock medio', color: 'bg-blue-900 text-blue-300' };
    return { label: 'Stock alto', color: 'bg-green-900 text-green-300' };
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Gestión de Inventarios</h1>
        <p className="text-gray-400">Controla el stock de todos tus productos</p>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-red-400 mr-3" size={24} />
            <h3 className="text-lg font-bold text-red-400">Productos sin Stock</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">{outOfStockProducts.length}</p>
          <p className="text-red-300 text-sm">Requieren reposición inmediata</p>
        </div>

        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Package className="text-yellow-400 mr-3" size={24} />
            <h3 className="text-lg font-bold text-yellow-400">Stock Bajo</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">{lowStockProducts.length}</p>
          <p className="text-yellow-300 text-sm">Productos con stock ≤ 5 kg</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => {
              const categoryId = e.target.value;
              setSelectedCategory(categoryId);
              loadProductsByCategory(categoryId);
            }}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
            disabled={isLoading}
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 size={40} className="animate-spin text-yellow-400" />
            <span className="ml-3 text-white">Cargando productos...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-gray-400 mb-4">No hay productos disponibles</p>
          </div>
        ) : (
          <>
            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left text-gray-300 px-6 py-4 font-semibold">Producto</th>
                    <th className="text-left text-gray-300 px-6 py-4 font-semibold">Categoría</th>
                    <th className="text-left text-gray-300 px-6 py-4 font-semibold">Stock Actual</th>
                    <th className="text-left text-gray-300 px-6 py-4 font-semibold">Estado</th>
                    <th className="text-left text-gray-300 px-6 py-4 font-semibold">Precio</th>
                    <th className="text-left text-gray-300 px-6 py-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="border-t border-gray-800 hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="text-white font-semibold">{product.name}</p>
                            <p className="text-gray-400 text-sm">{product.description ? product.description.substring(0, 30) + '...' : 'Sin descripción'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                          {getCategoryName(product.category_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-bold text-lg">
                          {product.stock} kg
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-400 font-semibold">
                          ${product.price.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateStock(product)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 size={16} className="animate-spin mr-1" />
                                <span>Cargando...</span>
                              </>
                            ) : (
                              <>
                                <Package size={16} />
                                <span>Actualizar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Visible only on mobile */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <div key={product.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start space-x-4 mb-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate mb-1">{product.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {product.description || 'Sin descripción'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white font-bold text-lg">{product.stock} kg</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Categoría</p>
                        <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold">
                          {getCategoryName(product.category_id)}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Precio</p>
                        <span className="text-green-400 font-semibold">
                          ${product.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleUpdateStock(product)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Cargando...</span>
                        </>
                      ) : (
                        <>
                          <Package size={16} />
                          <span>Actualizar Stock</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Update Stock Modal */}
      {showUpdateModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Actualizar Stock</h3>
            
            <div className="mb-4 p-4 bg-gray-800 rounded-lg">
              <p className="text-white font-semibold">{selectedProduct.name}</p>
              <p className="text-gray-400">Stock actual: {selectedProduct.stock} kg</p>
            </div>
            
            <form onSubmit={handleSubmitUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nuevo Stock (kg) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={newStock}
                  onChange={(e) => setNewStock(parseFloat(e.target.value))}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                />
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-300 text-sm mb-2">Cambio en stock:</p>
                <div className="flex items-center space-x-2">
                  {newStock > selectedProduct.stock ? (
                    <TrendingUp className="text-green-400" size={20} />
                  ) : newStock < selectedProduct.stock ? (
                    <TrendingDown className="text-red-400" size={20} />
                  ) : null}
                  <span className={`font-semibold ${
                    newStock > selectedProduct.stock ? 'text-green-400' :
                    newStock < selectedProduct.stock ? 'text-red-400' :
                    'text-gray-300'
                  }`}>
                    {newStock > selectedProduct.stock ? '+' : ''}
                    {(newStock - selectedProduct.stock).toFixed(1)} kg
                  </span>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedProduct(null);
                    setNewStock(0);
                  }}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isUpdating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-300 transition-colors flex items-center justify-center"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Stock'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;