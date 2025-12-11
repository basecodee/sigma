import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, CreditCard as Edit, Trash2, Eye, TrendingDown, AlertTriangle } from 'lucide-react';
import { categoriesService, itemsService, movementsService, reportsService } from '../services/inventoryService';

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
}

interface StockMovement {
  id: string;
  item_id: string;
  item_name: string;
  sku: string;
  movement_type: 'in' | 'out';
  quantity: number;
  reference_number: string;
  notes: string;
  created_by: string;
  created_at: string;
}

const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [reports, setReports] = useState<any>({});

  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab, searchTerm, selectedCategory, selectedStatus]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'categories':
          const categoriesResponse = await categoriesService.getAll();
          if (categoriesResponse.status === 'success') {
            setCategories(categoriesResponse.data);
          }
          break;

        case 'items':
          const itemsResponse = await itemsService.getAll({
            search: searchTerm,
            category: selectedCategory,
            status: selectedStatus
          });
          if (itemsResponse.status === 'success') {
            setItems(itemsResponse.data);
          }
          break;

        case 'movements':
          const movementsResponse = await movementsService.getAll();
          if (movementsResponse.status === 'success') {
            setMovements(movementsResponse.data);
          }
          break;

        case 'reports':
          const [stockSummary, lowStock] = await Promise.all([
            reportsService.getStockSummary(),
            reportsService.getLowStock()
          ]);
          setReports({
            stockSummary: stockSummary.status === 'success' ? stockSummary.data : [],
            lowStock: lowStock.status === 'success' ? lowStock.data : []
          });
          break;
      }
    } catch (err) {
      setError('Error loading data');
      console.error('Error loading inventory data:', err);
    } finally {
      setLoading(false);
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

  const getMovementTypeIcon = (type: string) => {
    return type === 'in' ? '↗️' : '↙️';
  };

  const getMovementTypeText = (type: string) => {
    return type === 'in' ? 'Masuk' : 'Keluar';
  };

  const getMovementTypeColor = (type: string) => {
    return type === 'in' 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
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
              Manajemen Inventaris
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola stok barang dan peralatan sistem
            </p>
          </div>
          <div className="flex space-x-2">
            {activeTab === 'items' && (
              <button 
                onClick={() => setShowAddItemModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Barang
              </button>
            )}
            {activeTab === 'categories' && (
              <button 
                onClick={() => setShowAddCategoryModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kategori
              </button>
            )}
          </div>
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

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'items', label: 'Daftar Barang', icon: Package },
              { id: 'categories', label: 'Kategori', icon: Filter },
              { id: 'movements', label: 'Pergerakan Stok', icon: TrendingDown },
              { id: 'reports', label: 'Laporan', icon: Eye }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Search and Filter */}
      {(activeTab === 'items' || activeTab === 'movements') && (
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
                placeholder={activeTab === 'items' ? 'Cari barang...' : 'Cari pergerakan stok...'}
              />
            </div>
          </div>
          
          {activeTab === 'items' && (
            <>
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
            </>
          )}
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'items' && (
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
                        <Package className="w-8 h-8 text-gray-400 mr-3" />
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
                      <div className="flex items-center">
                        <span className="mr-2">{item.stock_quantity}</span>
                        {item.stock_quantity <= item.min_stock_level && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
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
                          onClick={() => {
                            setSelectedItem(item);
                            setShowStockModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <TrendingDown className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
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
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-blue-500 mr-3" />
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
                  <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
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
      )}

      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Barang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Referensi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Catatan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(movement.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {movement.item_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {movement.sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center text-sm font-medium ${getMovementTypeColor(movement.movement_type)}`}>
                        <span className="mr-1">{getMovementTypeIcon(movement.movement_type)}</span>
                        {getMovementTypeText(movement.movement_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {movement.reference_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {movement.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {movements.length === 0 && (
            <div className="text-center py-12">
              <TrendingDown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">Belum ada pergerakan stok</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pergerakan stok akan muncul di sini</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Stock Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Ringkasan Stok per Kategori
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Habis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stok Rendah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nilai Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.stockSummary?.map((summary: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {summary.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {summary.total_items}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {summary.total_stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                        {summary.out_of_stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400">
                        {summary.low_stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(summary.total_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
              Peringatan Stok Rendah
            </h3>
            {reports.lowStock?.length > 0 ? (
              <div className="space-y-3">
                {reports.lowStock.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Stok: {item.stock_quantity} / Min: {item.min_stock_level}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.stock_status)}`}>
                      {getStatusText(item.stock_status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Semua stok dalam kondisi baik</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;