import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { monthlyService } from '../services/apiService';

interface MonthlySummaryData {
  month: string;
  monthName: string;
  unitKerja: number;
  edc: number;
  total: number;
}

interface MonthlySummaryProps {
  selectedYear: number;
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ selectedYear }) => {
  const [summaryData, setSummaryData] = useState<MonthlySummaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummaryData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await monthlyService.getSummary(selectedYear);
        
        if (response.status === 'success') {
          const formattedData = response.data.map((item: any) => ({
            month: item.month,
            monthName: item.month_name,
            unitKerja: item.unit_kerja_total,
            edc: item.edc_total,
            total: item.total_pendapatan
          }));
          setSummaryData(formattedData);
        } else {
          setError('Failed to load summary data');
        }
      } catch (err) {
        setError('Error loading summary data');
        console.error('Error loading monthly summary:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSummaryData();
  }, [selectedYear]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalPendapatan = summaryData.reduce((total, item) => total + item.total, 0);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">
              <p className="font-medium">Error loading summary</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Rekap Bulanan {selectedYear}
          </h3>
        </div>

        {/* Total Summary Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Pendapatan {selectedYear}</p>
              <p className="text-3xl font-bold">{formatCurrency(totalPendapatan)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Bulan
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Unit Kerja
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  EDC & CCTV
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {summaryData.map((item) => (
                <tr key={item.month} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.monthName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                    {formatCurrency(item.unitKerja)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                    {formatCurrency(item.edc)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-right">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;