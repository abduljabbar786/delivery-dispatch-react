import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) =>
  api.post('/login', { email, password });

export const logout = () => api.post('/logout');

// Orders
export const getOrders = (branchId = null) => {
  const params = branchId ? { branch_id: branchId } : {};
  return api.get('/orders', { params });
};

export const createOrder = (orderData) => api.post('/orders', orderData);

export const assignOrder = (orderId, riderId) =>
  api.post(`/orders/${orderId}/assign`, { rider_id: riderId });

export const updateOrderStatus = (orderId, status, reason = null) =>
  api.post(`/orders/${orderId}/status`, { status, reason });

// Riders
export const getRiders = (branchId = null) => {
  const params = branchId ? { branch_id: branchId } : {};
  return api.get('/riders', { params });
};

export const getRiderById = (riderId) => api.get(`/riders/${riderId}`);

export const createRider = (riderData) => api.post('/riders', riderData);

export const updateRider = (riderId, data) =>
  api.put(`/riders/${riderId}`, data);

// Branches
export const getBranches = () => api.get('/branches');

export const getBranchById = (branchId) => api.get(`/branches/${branchId}`);

export const createBranch = (branchData) => api.post('/branches', branchData);

export const updateBranch = (branchId, branchData) =>
  api.put(`/branches/${branchId}`, branchData);

export const deleteBranch = (branchId) => api.delete(`/branches/${branchId}`);

export const activateBranch = (branchId) =>
  api.post(`/branches/${branchId}/activate`);

export const deactivateBranch = (branchId) =>
  api.post(`/branches/${branchId}/deactivate`);

// Map
export const getRiderPositions = () => api.get('/map/riders');

// Settings
export const getSettings = (branchId = null) => {
  const params = branchId ? { branch_id: branchId } : {};
  return api.get('/settings', { params });
};

export const updateSettings = (settingsData) => api.put('/settings', settingsData);

export default api;
