import React from 'react';
import MonthlySummary from '../components/MonthlySummary';
import ChartSummary from '../components/ChartSummary';
import ExportButtons from '../components/ExportButtons';
import { monthlyService } from '../services/apiService';

interface RekapPageProps {
  selectedYear: number;
}

const RekapPage: React.FC<RekapPageProps> = ({ selectedYear }) => {
  // Generate monthly summary data for export
  const getMonthlySummaryData = () => {
    // This will be populated by the MonthlySummary component
    // For now, return empty array - the actual data will be fetched by the service
    return [];
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
              Rekap Pendapatan Bulanan - {selectedYear}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Analisis pendapatan gabungan dari Unit Kerja dan EDC & CCTV
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <ExportButtons
              data={getMonthlySummaryData()}
              type="monthly"
              year={selectedYear}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <MonthlySummary selectedYear={selectedYear} />
        </div>
        <div>
          <ChartSummary selectedYear={selectedYear} />
        </div>
      </div>
    </div>
  );
};

export default RekapPage;