import axios from 'axios';

// Retrieve the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

// Check if the API_URL is defined
if (!API_URL) {
  console.error("VITE_API_URL is not defined. Please set it in your .env file. Falling back to default.");
}

// Normalize API_URL by removing trailing slashes and ensuring it's valid
const normalizedApiUrl = API_URL ? API_URL.replace(/\/+$/, '') : 'http://localhost:3001';
console.log('API URL:', normalizedApiUrl);

const api = axios.create({
  baseURL: normalizedApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers
      });
    } else {
      console.warn('No token found in sessionStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });

    if (error.response?.status === 401) {
      console.warn('Unauthorized request, clearing token and redirecting to login');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('hedamo_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;