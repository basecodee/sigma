import React from 'react';
import { Menu, Calendar, Moon, Sun } from 'lucide-react';
import ExportButtons from './ExportButtons';

interface TopBarProps {
  onMenuToggle: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
  currentPage: string;
  getCurrentPageData: () => any[];
}

const TopBar: React.FC<TopBarProps> = ({
  onMenuToggle,
  darkMode,
  onDarkModeToggle,
  selectedYear,
  onYearChange,
  currentPage,
  getCurrentPageData
}) => {
  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Payment Dashboard System
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Year Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Export Buttons */}
          <div className="hidden md:block">
            <ExportButtons
              data={getCurrentPageData()}
              type={currentPage as 'unitkerja' | 'edc' | 'monthly'}
              year={selectedYear}
            />
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onDarkModeToggle}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;