import React from 'react';
import { Search } from 'lucide-react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ searchTerm, onSearchChange, placeholder }) => {
  return (
    <div className="mb-6">
      <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Pencarian
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default SearchFilter;