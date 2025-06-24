import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
};

// Shops API calls
export const shopsAPI = {
  getAll: (params) => api.get('/shops', { params }),
  getById: (id) => api.get(`/shops/${id}`),
  getBySlug: (slug) => api.get(`/shops/${slug}`),
  create: (shopData) => api.post('/shops', shopData),
  update: (id, shopData) => api.put(`/shops/${id}`, shopData),
  delete: (id) => api.delete(`/shops/${id}`),
  updateStatus: (id, status) => api.put(`/shops/${id}/status`, { status }),
  updateHours: (id, businessHours) => api.put(`/shops/${id}/hours`, { businessHours }),
  addImage: (id, imageData) => api.post(`/shops/${id}/images`, imageData),
  removeImage: (id, imageId) => api.delete(`/shops/${id}/images/${imageId}`),
  getNearby: (params) => api.get('/shops/nearby', { params }),
  search: (params) => api.get('/shops/search', { params }),
  getMyShops: () => api.get('/shops/my-shops'),
  getShopStats: (id) => api.get(`/shops/${id}/stats`),
};

// Services API calls
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (serviceData) => api.post('/services', serviceData),
  update: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  delete: (id) => api.delete(`/services/${id}`),
  getByShop: (shopId) => api.get(`/services/shop/${shopId}`),
  getByBarber: (barberId) => api.get(`/services/barber/${barberId}`),
  updatePrice: (id, price) => api.put(`/services/${id}/price`, { price }),
  updateDuration: (id, duration) => api.put(`/services/${id}/duration`, { duration }),
};

// Barbers API calls
export const barbersAPI = {
  getAll: (params) => api.get('/barbers', { params }),
  getById: (id) => api.get(`/barbers/${id}`),
  create: (barberData) => api.post('/barbers', barberData),
  update: (id, barberData) => api.put(`/barbers/${id}`, barberData),
  delete: (id) => api.delete(`/barbers/${id}`),
  updateHours: (id, workingHours) => api.put(`/barbers/${id}/hours`, { workingHours }),
  addService: (id, serviceId) => api.put(`/barbers/${id}/services`, { serviceId }),
  removeService: (id, serviceId) => api.delete(`/barbers/${id}/services/${serviceId}`),
  getByShop: (shopId) => api.get(`/barbers/shop/${shopId}`),
  getAvailable: (params) => api.get('/barbers/available', { params }),
  updateAvailability: (id, availability) => api.put(`/barbers/${id}/availability`, availability),
  getBarberStats: (id) => api.get(`/barbers/${id}/stats`),
};

// Appointments API calls
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (appointmentData) => api.post('/appointments', appointmentData),
  update: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
  reschedule: (id, newDateTime) => api.put(`/appointments/${id}/reschedule`, { newDateTime }),
  getMyAppointments: () => api.get('/appointments'),
  getShopAppointments: (shopId, params) => api.get(`/appointments/shop/${shopId}`, { params }),
  getBarberAppointments: (barberId, params) => api.get(`/appointments/barber/${barberId}`, { params }),
  getAvailableSlots: (params) => api.get('/appointments/available-slots', { params }),
  addReview: (id, reviewData) => api.post(`/appointments/${id}/review`, reviewData),
  getAppointmentStats: (params) => api.get('/appointments/stats', { params }),
};

// Users API calls (Admin only)
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updateStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
  getByRole: (role) => api.get(`/users/role/${role}`),
  getUserStats: () => api.get('/users/stats'),
};

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getSystemStats: () => api.get('/admin/stats'),
  getPendingShops: () => api.get('/admin/pending-shops'),
  approveShop: (id) => api.put(`/admin/shops/${id}/approve`),
  rejectShop: (id, reason) => api.put(`/admin/shops/${id}/reject`, { reason }),
  suspendShop: (id, reason) => api.put(`/admin/shops/${id}/suspend`, { reason }),
  activateShop: (id) => api.put(`/admin/shops/${id}/activate`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api; 