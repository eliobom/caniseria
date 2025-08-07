import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Move, Upload, Loader2, Eye, EyeOff } from 'lucide-react';
import { 
  getAllCategories,
  createCategory, 
  updateCategory, 
  deleteCategory,
  toggleCategoryVisibility 
} from '../../services/supabaseService';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  order: number;
  is_visible?: boolean;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    order: 0,
    is_visible: true
  });
  
  useEffect(() => {
    loadCategories();
  }, []);
  
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const fetchedCategories = await getAllCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      setMessage({ type: 'error', text: 'Error al cargar las categorías' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        setMessage({ type: 'success', text: 'Categoría actualizada exitosamente' });
      } else {
        await createCategory(formData);
        setMessage({ type: 'success', text: 'Categoría creada exitosamente' });
      }
      
      await loadCategories();
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', image: '', order: 0, is_visible: true });
    } catch (error: any) {
      console.error('Error saving category:', error);
      setMessage({ type: 'error', text: error.message || 'Error al guardar la categoría' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image,
      order: category.order,
      is_visible: category.is_visible ?? true
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      setIsLoading(true);
      try {
        const success = await deleteCategory(id);
        if (success) {
          await loadCategories();
          setMessage({ type: 'success', text: 'Categoría eliminada exitosamente' });
        } else {
          setMessage({ type: 'error', text: 'No se pudo eliminar la categoría. Puede que tenga productos asociados.' });
        }
      } catch (error) {
        console.error('Error eliminando categoría:', error);
        setMessage({ type: 'error', text: 'Error al eliminar la categoría' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleVisibility = async (categoryId: string, currentVisibility: boolean) => {
    try {
      console.log('Cambiando visibilidad de categoría:', categoryId, 'a:', !currentVisibility);
      
      const result = await toggleCategoryVisibility(categoryId, !currentVisibility);
      
      if (result) {
        console.log('Visibilidad cambiada exitosamente:', result);
        await loadCategories();
        
        setMessage({ 
          type: 'success', 
          text: `Categoría ${!currentVisibility ? 'mostrada' : 'ocultada'} exitosamente` 
        });
        
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error cambiando visibilidad:', error);
      
      setMessage({ 
        type: 'error', 
        text: error.message || 'Error al cambiar la visibilidad de la categoría' 
      });
      
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestión de Categorías</h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', description: '', image: '', order: 0, is_visible: true });
            setShowModal(true);
          }}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Mensaje de feedback global */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin text-yellow-400" size={32} />
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {category.image && (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                    <p className="text-gray-400">{category.description}</p>
                    <p className="text-sm text-gray-500">Orden: {category.order}</p>
                    <p className="text-sm text-gray-500">
                      Estado: {category.is_visible !== false ? 'Visible' : 'Oculta'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                    disabled={isLoading}
                  >
                    <Edit2 size={16} />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(category.id, category.is_visible ?? true)}
                    className={`py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 ${
                      category.is_visible !== false 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                    disabled={isLoading}
                    title={category.is_visible !== false ? 'Ocultar categoría' : 'Mostrar categoría'}
                  >
                    {category.is_visible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                    <span className="hidden sm:inline">{category.is_visible !== false ? 'Visible' : 'Oculta'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                    disabled={isLoading}
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Descripción *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none h-20"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">URL de Imagen</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Orden</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 outline-none"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_visible"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                  className="rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="is_visible" className="text-gray-300">Visible</label>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                  <span>{editingCategory ? 'Actualizar' : 'Crear'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '', description: '', image: '', order: 0, is_visible: true });
                  }}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;