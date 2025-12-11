import React from 'react';
import { Check, X, Building2, CreditCard } from 'lucide-react';

interface PaymentTableProps {
  data: any[];
  months: { key: string; label: string }[];
  onMonthToggle: (id: number, month: string) => void;
  type: 'unitkerja' | 'edc';
}

const PaymentTable: React.FC<PaymentTableProps> = ({ data, months, onMonthToggle, type }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          {type === 'unitkerja' ? (
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          ) : (
            <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          )}
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Data Pembayaran {type === 'unitkerja' ? 'Unit Kerja' : 'EDC & CCTV'}
          </h3>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Klik pada kolom bulan untuk mengubah status pembayaran
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">
                Lokasi
              </th>
              {type === 'edc' && (
                <>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Jenis
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tagihan
                  </th>
                </>
              )}
              {type === 'unitkerja' && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tarif
                </th>
              )}
              {months.map((month) => (
                <th key={month.key} scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {month.label}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  {item.nama_lokasi}
                </td>
                {type === 'edc' && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.jenis === 'EDC' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {item.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      {formatCurrency(item.tagihan)}
                    </td>
                  </>
                )}
                {type === 'unitkerja' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    {formatCurrency(item.tarif)}
                  </td>
                )}
                {months.map((month) => (
                  <td key={month.key} className="px-3 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onMonthToggle(item.id, month.key)}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 transform hover:scale-110 ${
                        item[month.key]
                          ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-gray-600'
                      }`}
                    >
                      {item[month.key] ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-gray-900 dark:text-white">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <Building2 className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Belum ada data</p>
            <p className="text-sm">Tambahkan data pembayaran untuk memulai</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTable;