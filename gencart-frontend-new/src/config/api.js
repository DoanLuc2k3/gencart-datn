// Centralized API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}";
export const API_HOST = API_BASE_URL.replace('/api', '');
export default API_BASE_URL;

