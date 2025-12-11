import React, { useState, useEffect } from 'react';
import { TrendingUp, Building2, CreditCard, Package, Users } from 'lucide-react';
import { unitKerjaService, edcService, monthlyService } from '../services/apiService';

interface DashboardPageProps {
  selectedYear: number;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ selectedYear }) => {
  const [stats, setStats] = useState({
    totalUnitKerja: 0,
    totalEdc: 0,
    totalRevenue: 0,
    totalLocations: 0,
    loading: true
  });

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }));
        
        const [unitKerjaResponse, edcResponse, monthlyResponse] = await Promise.all([
          unitKerjaService.getAll(selectedYear),
          edcService.getAll(selectedYear),
          monthlyService.getSummary(selectedYear)
        ]);

        let totalUnitKerja = 0;
        let totalEdc = 0;
        let totalLocations = 0;

        if (unitKerjaResponse.status === 'success') {
          totalUnitKerja = unitKerjaResponse.data.reduce((sum: number, item: any) => sum + item.total, 0);
          totalLocations += unitKerjaResponse.data.length;
        }

        if (edcResponse.status === 'success') {
          totalEdc = edcResponse.data.reduce((sum: number, item: any) => sum + item.total, 0);
          totalLocations += edcResponse.data.length;
        }

        let totalRevenue = 0;
        if (monthlyResponse.status === 'success') {
          totalRevenue = monthlyResponse.yearly_total || (totalUnitKerja + totalEdc);
        }

        setStats({
          totalUnitKerja,
          totalEdc,
          totalRevenue,
          totalLocations,
          loading: false
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadDashboardStats();
  }, [selectedYear]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Pendapatan',
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Unit Kerja',
      value: formatCurrency(stats.totalUnitKerja),
      icon: Building2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'EDC & CCTV',
      value: formatCurrency(stats.totalEdc),
      icon: CreditCard,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Total Lokasi',
      value: stats.totalLocations.toString(),
      icon: Package,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900',
      textColor: 'text-orange-600 dark:text-orange-400'
    }
  ];

  if (stats.loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview - {selectedYear}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Ringkasan data pembayaran dan statistik sistem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview - {selectedYear}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Ringkasan data pembayaran dan statistik sistem
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg shadow p-6 transition-transform duration-200 hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Aksi Cepat
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <div className="flex items-center">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                <span className="text-gray-900 dark:text-white">Tambah Unit Kerja Baru</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                <span className="text-gray-900 dark:text-white">Tambah EDC/CCTV Baru</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
                <span className="text-gray-900 dark:text-white">Kelola Inventaris</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informasi Sistem
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Tahun Aktif</span>
              <span className="font-semibold text-gray-900 dark:text-white">{selectedYear}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Lokasi</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.totalLocations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Status Sistem</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Aktif
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Mode Data</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' ? 'Demo' : 'Production'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;