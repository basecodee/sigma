import { API_ENDPOINTS, API_HEADERS, buildApiUrl, handleApiError } from '../config/api';

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

// Unit Kerja API Services
export const unitKerjaService = {
  getAll: async (year?: number) => {
    const url = buildApiUrl(API_ENDPOINTS.UNIT_KERJA, { year });
    return await apiRequest(url);
  },

  create: async (data: any) => {
    return await apiRequest(API_ENDPOINTS.UNIT_KERJA, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: async (id: number, data: any) => {
    const url = buildApiUrl(API_ENDPOINTS.UNIT_KERJA, { id });
    return await apiRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete: async (id: number) => {
    const url = buildApiUrl(API_ENDPOINTS.UNIT_KERJA, { id });
    return await apiRequest(url, {
      method: 'DELETE'
    });
  }
};

// EDC API Services
export const edcService = {
  getAll: async (year?: number) => {
    const url = buildApiUrl(API_ENDPOINTS.EDC, { year });
    return await apiRequest(url);
  },

  create: async (data: any) => {
    return await apiRequest(API_ENDPOINTS.EDC, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: async (id: number, data: any) => {
    const url = buildApiUrl(API_ENDPOINTS.EDC, { id });
    return await apiRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete: async (id: number) => {
    const url = buildApiUrl(API_ENDPOINTS.EDC, { id });
    return await apiRequest(url, {
      method: 'DELETE'
    });
  }
};

// Monthly Summary API Services
export const monthlyService = {
  getSummary: async (year?: number) => {
    const url = buildApiUrl(API_ENDPOINTS.MONTHLY, { year });
    return await apiRequest(url);
  }
};

// Authentication API Services
export const authService = {
  login: async (username: string, password: string) => {
    return await apiRequest(`${API_ENDPOINTS.AUTH}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  logout: async () => {
    return await apiRequest(`${API_ENDPOINTS.AUTH}/logout`, {
      method: 'POST'
    });
  }
};