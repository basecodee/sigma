import React, { useState, useEffect } from 'react';
import { Filter, Plus, CreditCard as Edit, Trash2, Package } from 'lucide-react';
import { categoriesService } from '../services/inventoryService';

interface Category {
  id: string;
  name: string;
  description: string;
  item_count: number;
}

const InventoryCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await categoriesService.getAll();
      if (response.status === 'success') {
        setCategories(response.data);
      }
    } catch (err) {
      setError('Error loading categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (categoryData: any) => {
    try {
      const response = await categoriesService.create(categoryData);
      if (response.status === 'success') {
        loadCategories();
        setShowAddModal(false);
      }
    } catch (error) {
      setError('Failed to add category');
    }
  };

  const handleEditCategory = async (categoryData: any) => {
    if (!editingCategory) return;
    
    try {
      const response = await categoriesService.update(editingCategory.id, categoryData);
      if (response.status === 'success') {
        loadCategories();
        setEditingCategory(null);
      }
    } catch (error) {
      setError('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await categoriesService.delete(id);
      if (response.status === 'success') {
        loadCategories();
      }
    } catch (error) {
      setError('Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Kategori Inventaris
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola kategori untuk mengorganisir inventaris
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kategori
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Filter className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {category.item_count} items
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setEditingCategory(category)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {category.description}
            </p>
          </div>
        ))}
        
        {categories.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">Belum ada kategori</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tambahkan kategori untuk mengorganisir inventaris</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingCategory) && (
        <CategoryModal
          category={editingCategory}
          onSave={editingCategory ? handleEditCategory : handleAddCategory}
          onClose={() => {
            setShowAddModal(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
};

// Category Modal Component
interface CategoryModalProps {
  category?: Category | null;
  onSave: (data: any) => void;
  onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {category ? 'Edit Kategori' : 'Tambah Kategori'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nama Kategori
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Masukkan nama kategori"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Masukkan deskripsi kategori"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              {category ? 'Update' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryCategoriesPage;