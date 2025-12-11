// API Configuration using environment variables
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
  TIMEOUT: 10000, // 10 seconds
  ENABLE_MOCK_DATA: false, // Always use real backend data
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true'
};

// API Endpoints
export const API_ENDPOINTS = {
  UNIT_KERJA: `${API_CONFIG.BASE_URL}/unitkerja`,
  EDC: `${API_CONFIG.BASE_URL}/edc`,
  MONTHLY: `${API_CONFIG.BASE_URL}/monthly`,
  AUTH: `${API_CONFIG.BASE_URL}/auth`,
  INVENTORY: `${API_CONFIG.BASE_URL}/inventory`
};

// HTTP Headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
};

// API Helper Functions
export const buildApiUrl = (endpoint: string, params?: Record<string, any>) => {
  const url = new URL(endpoint);
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key].toString());
      }
    });
  }
  return url.toString();
};

export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    return {
      status: 'error',
      message: error.response.data?.message || 'Server error occurred',
      code: error.response.status
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      status: 'error',
      message: 'Unable to connect to server. Please check your connection.',
      code: 'NETWORK_ERROR'
    };
  } else {
    // Something else happened
    return {
      status: 'error',
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };
  }
};