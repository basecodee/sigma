import { API_CONFIG, API_HEADERS, buildApiUrl, handleApiError } from '../config/api';

// Generic API request function
const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_HEADERS,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Categories Service
export const categoriesService = {
  getAll: async () => {
    const url = `${API_CONFIG.BASE_URL}/inventory/categories`;
    return await apiRequest(url);
  },

  create: async (data: any) => {
    const url = `${API_CONFIG.BASE_URL}/inventory/categories`;
    return await apiRequest(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: async (id: string, data: any) => {
    const url = buildApiUrl(`${API_CONFIG.BASE_URL}/inventory/categories`, { id });
    return await apiRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete: async (id: string) => {
    const url = buildApiUrl(`${API_CONFIG.BASE_URL}/inventory/categories`, { id });
    return await apiRequest(url, {
      method: 'DELETE'
    });
  }
};

// Items Service
export const itemsService = {
  getAll: async (filters: any = {}) => {
    const url = buildApiUrl(`${API_CONFIG.BASE_URL}/inventory/items`, filters);
    return await apiRequest(url);
  },

  create: async (data: any) => {
    const url = `${API_CONFIG.BASE_URL}/inventory/items`;
    return await apiRequest(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: async (id: string, data: any) => {
    const url = buildApiUrl(`${API_CONFIG.BASE_URL}/inventory/items`, { id });
    return await apiRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete: async (id: string) => {
    const url = buildApiUrl(`${API_CONFIG.BASE_URL}/inventory/items`, { id });
    return await apiRequest(url, {
      method: 'DELETE'
    });
  }
};

// Stock Movements Service
export const movementsService = {
  getAll: async (filters: any = {}) => {
    const url = buildApiUrl(`${API_CONFIG.BASE_URL}/inventory/movements`, filters);
    return await apiRequest(url);
  },

  create: async (data: any) => {
    const url = `${API_CONFIG.BASE_URL}/inventory/movements`;
    return await apiRequest(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// Reports Service
export const reportsService = {
  getStockSummary: async () => {
    const url = buildApiUrl(`${API_CONFIG.BASE_URL}/inventory/reports`, { type: 'stock_summary' });
    return await apiRequest(url);
  },

  getLowStock: async () => {
    const url = buildApiUrl(`${API_CONFIG.BASE_URL}/inventory/reports`, { type: 'low_stock' });
    return await apiRequest(url);
  },

  getMovements: async (days: number = 30) => {
    const url = buildApiUrl(`${API_CONFIG.BASE_URL}/inventory/reports`, { type: 'movements', days });
    return await apiRequest(url);
  }
};