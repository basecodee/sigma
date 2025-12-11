import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, CreditCard as Edit, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { itemsService, categoriesService } from '../services/inventoryService';

interface Category {
  id: string;
  name: string;
  description: string;
  item_count: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  sku: string;
  description: string;
  price: number;
  stock_quantity: number;
  min_stock_level: number;
  status: string;
  stock_status: string;
  image_url?: string;
}

const InventoryItemsPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedCategory, selectedStatus]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        itemsService.getAll({
          search: searchTerm,
          category: selectedCategory,
          status: selectedStatus
        }),
        categoriesService.getAll()
      ]);

      if (itemsResponse.status === 'success') {
        setItems(itemsResponse.data);
      }
      if (categoriesResponse.status === 'success') {
        setCategories(categoriesResponse.data);
      }
    } catch (err) {
      setError('Error loading data');
      console.error('Error loading inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (itemData: any) => {
    try {
      const response = await itemsService.create(itemData);
      if (response.status === 'success') {
        loadData();
        setShowAddModal(false);
      }
    } catch (error) {
      setError('Failed to add item');
    }
  };

  const handleEditItem = async (itemData: any) => {
    if (!editingItem) return;
    
    try {
      const response = await itemsService.update(editingItem.id, itemData);
      if (response.status === 'success') {
        loadData();
        setEditingItem(null);
      }
    } catch (error) {
      setError('Failed to update item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await itemsService.delete(id);
      if (response.status === 'success') {
        loadData();
      }
    } catch (error) {
      setError('Failed to delete item');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Tersedia';
      case 'low_stock':
        return 'Stok Rendah';
      case 'out_of_stock':
        return 'Habis';
      default:
        return 'Unknown';
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
              Daftar Barang
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola inventaris barang dan peralatan
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Barang
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

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Cari barang..."
            />
          </div>
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full sm:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">Semua Kategori</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="block w-full sm:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">Semua Status</option>
          <option value="available">Tersedia</option>
          <option value="low_stock">Stok Rendah</option>
          <option value="out_of_stock">Habis</option>
        </select>
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Barang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-gray-400 mr-3" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.stock_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.stock_status)}`}>
                      {getStatusText(item.stock_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {items.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">Belum ada barang</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tambahkan barang inventaris untuk memulai</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <ItemModal
          item={editingItem}
          categories={categories}
          onSave={editingItem ? handleEditItem : handleAddItem}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

// Item Modal Component
interface ItemModalProps {
  item?: InventoryItem | null;
  categories: Category[];
  onSave: (data: any) => void;
  onClose: () => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ item, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category_id: item?.category_id || '',
    sku: item?.sku || '',
    description: item?.description || '',
    price: item?.price || 0,
    stock_quantity: item?.stock_quantity || 0,
    min_stock_level: item?.min_stock_level || 5,
    status: item?.status || 'active',
    image_url: item?.image_url || ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(item?.image_url || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalData = { ...formData };
    
    // Handle image upload (in real implementation, upload to server/cloud storage)
    if (imageFile) {
      // For demo, we'll use the preview URL
      finalData.image_url = imagePreview;
    }
    
    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {item ? 'Edit Barang' : 'Tambah Barang'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gambar Barang
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Gambar
                  </label>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nama Barang
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kategori
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Pilih Kategori</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SKU
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Harga
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jumlah Stok
              </label>
              <input
                type="number"
                required
                value={formData.stock_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Min Stock Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Stok
              </label>
              <input
                type="number"
                required
                value={formData.min_stock_level}
                onChange={(e) => setFormData(prev => ({ ...prev, min_stock_level: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {item ? 'Update' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryItemsPage;