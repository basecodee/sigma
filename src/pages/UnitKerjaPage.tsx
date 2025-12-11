import React, { useState, useEffect } from 'react';
import PaymentTable from '../components/PaymentTable';
import AddDataModal from '../components/AddDataModal';
import SearchFilter from '../components/SearchFilter';
import ExportButtons from '../components/ExportButtons';
import { Plus } from 'lucide-react';
import { unitKerjaService } from '../services/apiService';

interface UnitKerja {
  id: number;
  nama_lokasi: string;
  year: number;
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
  tarif: number;
  total: number;
}

interface UnitKerjaPageProps {
  selectedYear: number;
}

const UnitKerjaPage: React.FC<UnitKerjaPageProps> = ({ selectedYear }) => {
  const [data, setData] = useState<UnitKerja[]>([]);
  const [filteredData, setFilteredData] = useState<UnitKerja[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data when year changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await unitKerjaService.getAll(selectedYear);
        
        if (response.status === 'success') {
          setData(response.data);
        } else {
          setError('Failed to load data');
        }
      } catch (err) {
        setError('Error loading data');
        console.error('Error loading unit kerja data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedYear]);

  useEffect(() => {
    const filtered = data.filter(item =>
      item.nama_lokasi.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [data, searchTerm]);

  const handleMonthToggle = (id: number, month: string) => {
    const updatePayment = async () => {
      try {
        const item = data.find(d => d.id === id);
        if (!item) return;

        const updatedData = { [month]: !item[month as keyof UnitKerja] };
        await unitKerjaService.update(id, updatedData);
        
        // Update local state
        setData(prevData =>
          prevData.map(item => {
            if (item.id === id) {
              const updatedItem = { ...item, [month]: !item[month] };
              
              // Calculate total
              const months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
              const checkedMonths = months.filter(m => updatedItem[m as keyof UnitKerja]).length;
              updatedItem.total = checkedMonths * updatedItem.tarif;
              
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

  const handleAddData = async (newData: Omit<UnitKerja, 'id' | 'total' | 'year'>) => {
    try {
      const dataToAdd = {
        ...newData,
        year: selectedYear
      };
      
      const response = await unitKerjaService.create(dataToAdd);
      
      if (response.status === 'success') {
        // Reload data to get the new item with proper ID
        const updatedResponse = await unitKerjaService.getAll(selectedYear);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              Rekap Pembayaran Unit Kerja - {selectedYear}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kelola dan pantau pembayaran bulanan unit kerja dengan tarif Rp 100.000/bulan
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <div className="mr-4">
              <ExportButtons
                data={filteredData}
                type="unitkerja"
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

      <SearchFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Cari nama lokasi unit kerja..."
      />

      <PaymentTable
        data={filteredData}
        months={months}
        onMonthToggle={handleMonthToggle}
        type="unitkerja"
      />

      <AddDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddData}
        type="unitkerja"
      />
    </div>
  );
};

export default UnitKerjaPage;