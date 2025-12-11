import React, { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, TrendingUp, Package, Download } from 'lucide-react';
import { reportsService } from '../services/inventoryService';

interface StockSummary {
  category: string;
  total_items: number;
  total_stock: number;
  out_of_stock: number;
  low_stock: number;
  total_value: number;
}

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  min_stock_level: number;
  stock_status: string;
  category_name: string;
}

const InventoryReportsPage: React.FC = () => {
  const [stockSummary, setStockSummary] = useState<StockSummary[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const [stockSummaryResponse, lowStockResponse] = await Promise.all([
        reportsService.getStockSummary(),
        reportsService.getLowStock()
      ]);

      if (stockSummaryResponse.status === 'success') {
        setStockSummary(stockSummaryResponse.data);
      }
      if (lowStockResponse.status === 'success') {
        setLowStockItems(lowStockResponse.data);
      }
    } catch (err) {
      setError('Error loading reports');
      console.error('Error loading reports:', err);
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

  const totalValue = stockSummary.reduce((sum, item) => sum + item.total_value, 0);
  const totalItems = stockSummary.reduce((sum, item) => sum + item.total_items, 0);
  const totalStock = stockSummary.reduce((sum, item) => sum + item.total_stock, 0);
  const totalOutOfStock = stockSummary.reduce((sum, item) => sum + item.out_of_stock, 0);

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
              Laporan Inventaris
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Analisis dan ringkasan data inventaris
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
            <Download className="w-4 h-4 mr-2" />
            Export Laporan
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Items</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Stok</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{totalStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-6">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Nilai</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Stok Habis</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">{totalOutOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock Summary by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
            Ringkasan Stok per Kategori
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nilai
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stockSummary.map((summary, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {summary.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {summary.total_items}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <span className="mr-2">{summary.total_stock}</span>
                        {(summary.out_of_stock > 0 || summary.low_stock > 0) && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
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
          {lowStockItems.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {item.category_name} • SKU: {item.sku}
                    </p>
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
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Semua stok dalam kondisi baik</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryReportsPage;