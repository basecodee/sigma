import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Package, Calendar } from 'lucide-react';
import { itemsService, movementsService } from '../services/inventoryService';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
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

const InventoryStockInPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [itemsResponse, movementsResponse] = await Promise.all([
        itemsService.getAll(),
        movementsService.getAll()
      ]);

      if (itemsResponse.status === 'success') {
        setItems(itemsResponse.data);
      }
      if (movementsResponse.status === 'success') {
        // Filter only 'in' movements
        const inMovements = movementsResponse.data.filter((m: StockMovement) => m.movement_type === 'in');
        setMovements(inMovements);
      }
    } catch (err) {
      setError('Error loading data');
      console.error('Error loading stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStockIn = async (movementData: any) => {
    try {
      const response = await movementsService.create({
        ...movementData,
        movement_type: 'in',
        created_by: 'admin' // In real app, get from auth context
      });
      
      if (response.status === 'success') {
        loadData();
        setShowAddModal(false);
      }
    } catch (error) {
      setError('Failed to add stock in');
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
              Stok Masuk
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola penerimaan stok barang inventaris
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Stok Masuk
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

      {/* Stock In History */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Riwayat Stok Masuk
            </h3>
          </div>
        </div>

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
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Referensi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Catatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Oleh
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {movements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {new Date(movement.created_at).toLocaleDateString('id-ID')}
                    </div>
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      +{movement.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {movement.reference_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {movement.notes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {movement.created_by}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {movements.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">Belum ada stok masuk</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tambahkan stok masuk untuk memulai tracking</p>
          </div>
        )}
      </div>

      {/* Add Stock In Modal */}
      {showAddModal && (
        <StockInModal
          items={items}
          onSave={handleAddStockIn}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

// Stock In Modal Component
interface StockInModalProps {
  items: InventoryItem[];
  onSave: (data: any) => void;
  onClose: () => void;
}

const StockInModal: React.FC<StockInModalProps> = ({ items, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    item_id: '',
    quantity: 0,
    reference_number: '',
    notes: ''
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
            Tambah Stok Masuk
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
                Pilih Barang
              </label>
              <select
                required
                value={formData.item_id}
                onChange={(e) => setFormData(prev => ({ ...prev, item_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Pilih Barang</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku}) - Stok: {item.stock_quantity}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jumlah Masuk
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Masukkan jumlah"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nomor Referensi
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="PO-2024-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catatan
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Catatan tambahan..."
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
              Tambah Stok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryStockInPage;