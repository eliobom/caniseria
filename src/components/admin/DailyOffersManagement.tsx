import React, { useState, useEffect } from 'react';
import { 
  getAllDailyOffers, 
  createDailyOffer, 
  updateDailyOffer, 
  deleteDailyOffer, 
  toggleDailyOfferStatus,
  getProducts
} from '../../services/supabaseService';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Percent } from 'lucide-react';

interface DailyOffer {
  id: string;
  product_id: string;
  discount_percentage: number;
  original_price: number;
  discounted_price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  products: {
    id: string;
    name: string;
    description: string;
    image: string;
    category_id: string;
    stock: number;
  };
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

const DailyOffersManagement: React.FC = () => {
  const [offers, setOffers] = useState<DailyOffer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<DailyOffer | null>(null);
  const [formData, setFormData] = useState({
    product_id: '',
    discount_percentage: 20,
    original_price: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOffers();
    fetchProducts();
  }, []);

  const fetchOffers = async () => {
    try {
      const data = await getAllDailyOffers();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingOffer) {
        await updateDailyOffer(editingOffer.id, formData);
      } else {
        await createDailyOffer(formData);
      }
      
      await fetchOffers();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Error al guardar la oferta');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (offer: DailyOffer) => {
    setEditingOffer(offer);
    setFormData({
      product_id: offer.product_id,
      discount_percentage: offer.discount_percentage,
      original_price: offer.original_price,
      start_date: offer.start_date,
      end_date: offer.end_date
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta oferta?')) {
      try {
        await deleteDailyOffer(id);
        await fetchOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
        alert('Error al eliminar la oferta');
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleDailyOfferStatus(id, !currentStatus);
      await fetchOffers();
    } catch (error) {
      console.error('Error toggling offer status:', error);
      alert('Error al cambiar el estado de la oferta');
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      discount_percentage: 20,
      original_price: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setEditingOffer(null);
  };

  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setFormData({
        ...formData,
        product_id: productId,
        original_price: selectedProduct.price
      });
    }
  };

  const calculateDiscountedPrice = () => {
    return Math.round(formData.original_price * (1 - formData.discount_percentage / 100) * 100) / 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Percent className="mr-2" />
          Gestión de Ofertas del Día
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="mr-2" size={20} />
          Nueva Oferta
        </button>
      </div>

      {/* Lista de ofertas */}
      <div className="grid gap-4">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={offer.products.image}
                  alt={offer.products.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="text-lg font-semibold text-white">{offer.products.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span>Descuento: {offer.discount_percentage}%</span>
                    <span>Precio original: ${offer.original_price}</span>
                    <span className="text-yellow-400 font-semibold">Precio oferta: ${offer.discounted_price}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Desde: {offer.start_date}</span>
                    <span>Hasta: {offer.end_date}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      offer.is_active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {offer.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleStatus(offer.id, offer.is_active)}
                  className={`p-2 rounded-lg transition-colors ${
                    offer.is_active 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                  title={offer.is_active ? 'Desactivar' : 'Activar'}
                >
                  {offer.is_active ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <button
                  onClick={() => handleEdit(offer)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para crear/editar oferta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingOffer ? 'Editar Oferta' : 'Nueva Oferta'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Producto
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                >
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Precio Original
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => setFormData({...formData, original_price: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Descuento (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({...formData, discount_percentage: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div className="text-sm text-gray-300">
                Precio con descuento: <span className="text-yellow-400 font-semibold">${calculateDiscountedPrice()}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : (editingOffer ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyOffersManagement;