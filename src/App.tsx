import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardPage from './pages/DashboardPage';
import UnitKerjaPage from './pages/UnitKerjaPage';
import EdcPage from './pages/EdcPage';
import RekapPage from './pages/RekapPage';
import InventoryItemsPage from './pages/InventoryItemsPage';
import InventoryCategoriesPage from './pages/InventoryCategoriesPage';
import InventoryStockInPage from './pages/InventoryStockInPage';
import InventoryStockOutPage from './pages/InventoryStockOutPage';
import InventoryReportsPage from './pages/InventoryReportsPage';
import { getUnitKerjaDataByYear, getEdcDataByYear } from './data/mockData';

function AppContent() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState('unitkerja');
  const { user } = useAuth();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current page data for export
  const getCurrentPageData = () => {
    switch (currentPage) {
      case 'unitkerja':
        return getUnitKerjaDataByYear(selectedYear);
      case 'edc':
        return getEdcDataByYear(selectedYear);
      case 'monthly':
        // Generate monthly summary data
        const unitKerjaData = getUnitKerjaDataByYear(selectedYear);
        const edcData = getEdcDataByYear(selectedYear);
        const months = [
          { key: 'jan', name: 'Januari' },
          { key: 'feb', name: 'Februari' },
          { key: 'mar', name: 'Maret' },
          { key: 'apr', name: 'April' },
          { key: 'mei', name: 'Mei' },
          { key: 'jun', name: 'Juni' },
          { key: 'jul', name: 'Juli' },
          { key: 'agu', name: 'Agustus' },
          { key: 'sep', name: 'September' },
          { key: 'okt', name: 'Oktober' },
          { key: 'nov', name: 'November' },
          { key: 'des', name: 'Desember' }
        ];
        return months.map(month => {
          const unitKerjaTotal = unitKerjaData.reduce((total, item) => {
            return total + (item[month.key as keyof typeof item] ? item.tarif : 0);
          }, 0);
          const edcTotal = edcData.reduce((total, item) => {
            return total + (item[month.key as keyof typeof item] ? item.tagihan : 0);
          }, 0);
          return {
            month: month.key,
            monthName: month.name,
            unitKerja: unitKerjaTotal,
            edc: edcTotal,
            total: unitKerjaTotal + edcTotal
          };
        });
      default:
        return [];
    }
  };

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)} 
          />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:ml-64">
            {/* Top Bar */}
            <TopBar
              onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
              darkMode={darkMode}
              onDarkModeToggle={() => setDarkMode(!darkMode)}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              currentPage={currentPage}
              getCurrentPageData={getCurrentPageData}
            />
            
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage selectedYear={selectedYear} />} />
              <Route path="/" element={<UnitKerjaPage selectedYear={selectedYear} />} />
              <Route path="/edc" element={<EdcPage selectedYear={selectedYear} />} />
              <Route path="/rekap" element={<RekapPage selectedYear={selectedYear} />} />
              <Route path="/inventory/items" element={<InventoryItemsPage />} />
              <Route path="/inventory/categories" element={<InventoryCategoriesPage />} />
              <Route path="/inventory/stock-in" element={<InventoryStockInPage />} />
              <Route path="/inventory/stock-out" element={<InventoryStockOutPage />} />
              <Route path="/inventory/reports" element={<InventoryReportsPage />} />
              <Route path="/settings" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan</h2><p className="text-gray-600 dark:text-gray-400">Halaman pengaturan akan segera tersedia.</p></div>} />
            </Routes>
          </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;