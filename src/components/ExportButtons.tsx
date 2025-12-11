import React from 'react';
import { Download, FileText } from 'lucide-react';
import {
  exportUnitKerjaToExcel,
  exportEdcToExcel,
  exportMonthlySummaryToExcel,
  exportUnitKerjaToPDF,
  exportEdcToPDF,
  exportMonthlySummaryToPDF
} from '../utils/exportUtils';

interface ExportButtonsProps {
  data: any[];
  type: 'unitkerja' | 'edc' | 'monthly';
  year: number;
  className?: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data, type, year, className = '' }) => {
  const handleExcelExport = () => {
    switch (type) {
      case 'unitkerja':
        exportUnitKerjaToExcel(data, year);
        break;
      case 'edc':
        exportEdcToExcel(data, year);
        break;
      case 'monthly':
        exportMonthlySummaryToExcel(data, year);
        break;
    }
  };

  const handlePDFExport = () => {
    switch (type) {
      case 'unitkerja':
        exportUnitKerjaToPDF(data, year);
        break;
      case 'edc':
        exportEdcToPDF(data, year);
        break;
      case 'monthly':
        exportMonthlySummaryToPDF(data, year);
        break;
    }
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <button
        onClick={handleExcelExport}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-200"
      >
        <Download className="w-4 h-4 mr-2" />
        Excel
      </button>
      <button
        onClick={handlePDFExport}
        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors duration-200"
      >
        <FileText className="w-4 h-4 mr-2" />
        PDF
      </button>
    </div>
  );
};

export default ExportButtons;