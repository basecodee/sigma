import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Building2, 
  CreditCard, 
  BarChart3, 
  Package, 
  Menu, 
  X, 
  ChevronDown,
  Home,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      exact: true
    },
    {
      title: 'Unit Kerja',
      icon: Building2,
      path: '/',
      exact: true
    },
    {
      title: 'EDC & CCTV',
      icon: CreditCard,
      path: '/edc'
    },
    {
      title: 'Rekap Bulanan',
      icon: BarChart3,
      path: '/rekap'
    }
  ];

  const inventoryItems = [
    {
      title: 'Daftar Barang',
      path: '/inventory/items'
    },
    {
      title: 'Kategori',
      path: '/inventory/categories'
    },
    {
      title: 'Stok Masuk',
      path: '/inventory/stock-in'
    },
    {
      title: 'Stok Keluar',
      path: '/inventory/stock-out'
    },
    {
      title: 'Laporan Stok',
      path: '/inventory/reports'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64 flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
              Dashboard
            </span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.title}
            </NavLink>
          ))}

          {/* Inventory Dropdown */}
          <div>
            <button
              onClick={() => setInventoryOpen(!inventoryOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                location.pathname.startsWith('/inventory')
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <Package className="w-5 h-5 mr-3" />
                Inventaris
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                inventoryOpen ? 'rotate-180' : ''
              }`} />
            </button>
            
            {inventoryOpen && (
              <div className="mt-2 ml-8 space-y-1">
                {inventoryItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        isActive
                          ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    {item.title}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`
            }
          >
            <Settings className="w-5 h-5 mr-3" />
            Pengaturan
          </NavLink>
          
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Keluar
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;