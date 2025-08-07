import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2, Eye, EyeOff } from 'lucide-react';
import { 
  getProducts, 
  getCategories, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  toggleProductVisibility 
} from '../../services/supabaseService';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image: string;
  stock: number;
  unit_type: 'unidad' | 'kg' | 'paquete';
  is_visible?: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  order: number;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    image: '',
    stock: 0,
    unit_type: 'kg' as 'unidad' | 'kg' | 'paquete'
  });
  
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
        const productsData = await getProducts();
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error cargando productos por categoría:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      // Validar campos requeridos
      if (!formData.name.trim()) {
        throw new Error('El nombre es requerido');
      }
      if (!formData.description.trim()) {
        throw new Error('La descripción es requerida');
      }
      if (!formData.category_id) {
        throw new Error('La categoría es requerida');
      }
      if (!formData.image.trim()) {
        throw new Error('La URL de la imagen es requerida');
      }
      if (formData.price <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }
      if (formData.stock < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      let result;
      if (editingProduct) {
        // Actualizar producto existente
        result = await updateProduct(editingProduct.id, formData);
        setMessage({ type: 'success', text: 'Producto actualizado exitosamente' });
      } else {
        // Crear nuevo producto
        result = await createProduct(formData);
        setMessage({ type: 'success', text: 'Producto creado exitosamente' });
      }
      
      if (result) {
        // Recargar productos
        await loadData();
        
        // Resetear formulario después de un breve delay para mostrar el mensaje
        setTimeout(() => {
          setShowModal(false);
          setEditingProduct(null);
          setFormData({
            name: '',
            description: '',
            price: 0,
            category_id: '',
            image: '',
            stock: 0,
            unit_type: 'kg'
          });
          setMessage(null);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error guardando producto:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Error al guardar el producto. Por favor, intenta de nuevo.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category_id: product.category_id,
      image: product.image || '',
      stock: product.stock,
      unit_type: product.unit_type || 'kg'
    });
    setShowModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      setIsLoading(true);
      try {
        await deleteProduct(productId);
        await loadData();
      } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('Error al eliminar el producto');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleVisibility = async (productId: string, currentVisibility: boolean) => {
    try {
      await toggleProductVisibility(productId, !currentVisibility);
      await loadData();
    } catch (error) {
      console.error('Error cambiando visibilidad:', error);
      alert('Error al cambiar la visibilidad del producto');
    }
  };



  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Productos</h1>
          <p className="text-gray-400">Administra el catálogo de productos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors flex items-center space-x-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin mr-2" />
              <span>Cargando...</span>
            </>
          ) : (
            <>
              <Plus size={20} />
              <span>Nuevo Producto</span>
            </>
          )}
        </button>
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
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table - Desktop */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 size={40} className="animate-spin text-yellow-400" />
            <span className="ml-3 text-white">Cargando productos...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-gray-400 mb-4">No hay productos disponibles</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors inline-flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Agregar producto
            </button>
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
                    <th className="text-left text-gray-300 px-6 py-4 font-semibold">Precio</th>
                    <th className="text-left text-gray-300 px-6 py-4 font-semibold">Stock</th>
                    <th className="text-left text-gray-300 px-6 py-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-gray-800 hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-white font-semibold">{product.name}</p>
                            {product.is_visible === false && (
                              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                Oculto
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{product.description ? product.description.substring(0, 50) + '...' : 'Sin descripción'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                        {getCategoryName(product.category_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-400 font-semibold">
                        ${product.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        product.stock > 10 ? 'bg-green-900 text-green-300' :
                        product.stock > 5 ? 'bg-yellow-900 text-yellow-300' :
                        'bg-red-900 text-red-300'
                      }`}>
                        {product.stock} kg
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                          disabled={isSubmitting}
                          title="Editar producto"
                        >
                          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Edit2 size={16} />}
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(product.id, product.is_visible ?? true)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.is_visible !== false 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-gray-600 hover:bg-gray-700 text-white'
                          }`}
                          disabled={isSubmitting}
                          title={product.is_visible !== false ? 'Ocultar producto' : 'Mostrar producto'}
                        >
                          {product.is_visible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                          disabled={isSubmitting}
                          title="Eliminar producto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Visible only on mobile */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-semibold truncate">{product.name}</h3>
                        {product.is_visible === false && (
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
                            Oculto
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {product.description || 'Sin descripción'}
                      </p>
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
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Stock</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.stock > 10 ? 'bg-green-900 text-green-300' :
                        product.stock > 5 ? 'bg-yellow-900 text-yellow-300' :
                        'bg-red-900 text-red-300'
                      }`}>
                        {product.stock} kg
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                      disabled={isSubmitting}
                    >
                      <Edit2 size={14} />
                      <span className="text-sm">Editar</span>
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(product.id, product.is_visible ?? true)}
                      className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 ${
                        product.is_visible !== false 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                      disabled={isSubmitting}
                    >
                      {product.is_visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                      <span className="text-sm">{product.is_visible !== false ? 'Ocultar' : 'Mostrar'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                      disabled={isSubmitting}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl border border-gray-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            
            {/* Mensaje de feedback */}
            {message && (
              <div className={`p-3 rounded-lg mb-4 ${
                message.type === 'success' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Categoría *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Descripción *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none h-20"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Unidad de Venta *</label>
                  <select
                    required
                    value={formData.unit_type}
                    onChange={(e) => setFormData({ ...formData, unit_type: e.target.value as 'unidad' | 'kg' | 'paquete' })}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                  >
                    <option value="unidad">Por Unidad</option>
                    <option value="kg">Por Kilogramo</option>
                    <option value="paquete">Por Paquete</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">
                    Precio por {formData.unit_type === 'unidad' ? 'unidad' : 
                                formData.unit_type === 'kg' ? 'kilogramo' : 
                                'paquete'} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                      className="w-full bg-gray-800 text-white pl-8 pr-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                      placeholder={`Precio por ${formData.unit_type === 'unidad' ? 'unidad' : 
                                       formData.unit_type === 'kg' ? 'kg' : 
                                       'paquete'}`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">
                    Stock ({formData.unit_type === 'unidad' ? 'unidades' : formData.unit_type === 'kg' ? 'kg' : 'paquetes'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step={formData.unit_type === 'kg' ? '0.1' : '1'}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) })}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">URL de Imagen *</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    setFormData({ name: '', description: '', price: 0, image: '', category_id: '', stock: 0, unit_type: 'kg' });
                  }}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-300 transition-colors flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      {editingProduct ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    editingProduct ? 'Actualizar' : 'Crear'
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

export default ProductManagement;