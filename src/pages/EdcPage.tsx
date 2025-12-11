import React, { useState, useEffect } from 'react';
import PaymentTable from '../components/PaymentTable';
import AddDataModal from '../components/AddDataModal';
import SearchFilter from '../components/SearchFilter';
import ExportButtons from '../components/ExportButtons';
import { Plus } from 'lucide-react';
import { edcService } from '../services/apiService';

interface EdcCctv {
  id: number;
  nama_lokasi: string;
  year: number;
  jenis: 'EDC' | 'EDC + CCTV';
  tagihan: number;
  jan: boolean;
  feb: boolean;
  mar: boolean;
  apr: boolean;
  mei: boolean;
  jun: boolean;
  jul: boolean;
  agu: boolean;
  sep: boolean;
  okt: boolean;
  nov: boolean;
  des: boolean;
  total: number;
}

interface EdcPageProps {
  selectedYear: number;
}

const EdcPage: React.FC<EdcPageProps> = ({ selectedYear }) => {
  const [data, setData] = useState<EdcCctv[]>([]);
  const [filteredData, setFilteredData] = useState<EdcCctv[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data when year changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await edcService.getAll(selectedYear);
        
        if (response.status === 'success') {
          setData(response.data);
        } else {
          setError('Failed to load data');
        }
      } catch (err) {
        setError('Error loading data');
        console.error('Error loading EDC data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedYear]);

  useEffect(() => {
    let filtered = data.filter(item =>
      item.nama_lokasi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterJenis !== 'all') {
      filtered = filtered.filter(item => item.jenis === filterJenis);
    }

    setFilteredData(filtered);
  }, [data, searchTerm, filterJenis]);

  const handleMonthToggle = (id: number, month: string) => {
    const updatePayment = async () => {
      try {
        const item = data.find(d => d.id === id);
        if (!item) return;

        const updatedData = { [month]: !item[month as keyof EdcCctv] };
        await edcService.update(id, updatedData);
        
        // Update local state
        setData(prevData =>
          prevData.map(item => {
            if (item.id === id) {
              const updatedItem = { ...item, [month]: !item[month] };
              
              // Calculate total based on type
              const months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
              const checkedMonths = months.filter(m => updatedItem[m as keyof EdcCctv]).length;
              updatedItem.total = checkedMonths * updatedItem.tagihan;
              
              return updatedItem;
            }
            return item;
          })
        );
      } catch (error) {
        console.error('Error updating payment:', error);
        setError('Failed to update payment status');
      }
    };

    updatePayment();
  };

  const handleAddData = async (newData: Omit<EdcCctv, 'id' | 'total' | 'year'>) => {
    try {
      const dataToAdd = {
        ...newData,
        year: selectedYear
      };
      
      const response = await edcService.create(dataToAdd);
      
      if (response.status === 'success') {
        // Reload data to get the new item with proper ID
        const updatedResponse = await edcService.getAll(selectedYear);
        if (updatedResponse.status === 'success') {
          setData(updatedResponse.data);
        }
      } else {
        setError('Failed to add new data');
      }
    } catch (error) {
      console.error('Error adding data:', error);
      setError('Failed to add new data');
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const months = [
    { key: 'jan', label: 'Jan' },
    { key: 'feb', label: 'Feb' },
    { key: 'mar', label: 'Mar' },
    { key: 'apr', label: 'Apr' },
    { key: 'mei', label: 'Mei' },
    { key: 'jun', label: 'Jun' },
    { key: 'jul', label: 'Jul' },
    { key: 'agu', label: 'Agu' },
    { key: 'sep', label: 'Sep' },
    { key: 'okt', label: 'Okt' },
    { key: 'nov', label: 'Nov' },
    { key: 'des', label: 'Des' }
  ];

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
              Rekap Pembayaran EDC & CCTV - {selectedYear}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kelola pembayaran bulanan EDC (Rp 35.000) dan EDC + CCTV (Rp 135.000)
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <div className="mr-4">
              <ExportButtons
                data={filteredData}
                type="edc"
                year={selectedYear}
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Data
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SearchFilter 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Cari nama lokasi EDC/CCTV..."
        />
        
        <div>
          <label htmlFor="filter-jenis" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter Jenis
          </label>
          <select
            id="filter-jenis"
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">Semua Jenis</option>
            <option value="EDC">EDC Only</option>
            <option value="EDC + CCTV">EDC + CCTV</option>
          </select>
        </div>
      </div>

      <PaymentTable
        data={filteredData}
        months={months}
        onMonthToggle={handleMonthToggle}
        type="edc"
      />

      <AddDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddData}
        type="edc"
      />
    </div>
  );
};

export default EdcPage;