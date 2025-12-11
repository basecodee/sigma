import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { BarChart3, TrendingUp } from 'lucide-react';
import { monthlyService } from '../services/apiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ChartSummaryProps {
  selectedYear: number;
}

const ChartSummary: React.FC<ChartSummaryProps> = ({ selectedYear }) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await monthlyService.getSummary(selectedYear);
        
        if (response.status === 'success') {
          const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
            'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
          ];

          const monthlyUnitKerjaTotals: number[] = [];
          const monthlyEdcTotals: number[] = [];
          const totalData: number[] = [];

          response.data.forEach((item: any) => {
            monthlyUnitKerjaTotals.push(item.unit_kerja_total);
            monthlyEdcTotals.push(item.edc_total);
            totalData.push(item.total_pendapatan);
          });

          const data = {
            labels: months,
            datasets: [
              {
                label: 'Unit Kerja',
                data: monthlyUnitKerjaTotals,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
              },
              {
                label: 'EDC & CCTV',
                data: monthlyEdcTotals,
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 2,
              },
              {
                label: 'Total',
                data: totalData,
                backgroundColor: 'rgba(139, 92, 246, 0.5)',
                borderColor: 'rgb(139, 92, 246)',
                borderWidth: 2,
              }
            ],
          };

          setChartData(data);
        } else {
          setError('Failed to load chart data');
        }
      } catch (err) {
        setError('Error loading chart data');
        console.error('Error loading chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [selectedYear]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Grafik Pendapatan Bulanan ${selectedYear}`,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(context.parsed.y);
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
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
              <p className="font-medium">Error loading chart</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No chart data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Analisis Grafik {selectedYear}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                chartType === 'bar'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                chartType === 'line'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Line Chart
            </button>
          </div>
        </div>

        <div className="h-64">
          {chartType === 'bar' ? (
            <Bar data={chartData} options={options} />
          ) : (
            <Line data={chartData} options={options} />
          )}
        </div>

        {/* Chart Insights */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">Unit Kerja</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
              {chartData.datasets[0].data.reduce((a: number, b: number) => a + b, 0).toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              })}
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="ml-2 text-sm font-medium text-green-600 dark:text-green-400">EDC & CCTV</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-green-900 dark:text-green-100">
              {chartData.datasets[1].data.reduce((a: number, b: number) => a + b, 0).toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              })}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="ml-2 text-sm font-medium text-purple-600 dark:text-purple-400">Total {selectedYear}</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-purple-900 dark:text-purple-100">
              {chartData.datasets[2].data.reduce((a: number, b: number) => a + b, 0).toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartSummary;