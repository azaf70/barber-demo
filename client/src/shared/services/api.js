import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
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
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
};

// Customer API
export const customerAPI = {
  // Profile
  getProfile: () => api.get('/customers/profile'),
  updateProfile: (profileData) => api.put('/customers/profile', profileData),
  
  // Bookings
  getBookings: (params) => api.get('/customers/bookings', { params }),
  createBooking: (bookingData) => api.post('/customers/bookings', bookingData),
  updateBooking: (bookingId, bookingData) => api.put(`/customers/bookings/${bookingId}`, bookingData),
  cancelBooking: (bookingId, reason) => api.delete(`/customers/bookings/${bookingId}`, { data: { reason } }),
  
  // Favorites
  getFavorites: () => api.get('/customers/favorites'),
  addToFavorites: (shopId) => api.post('/customers/favorites', { shopId }),
  removeFromFavorites: (shopId) => api.delete(`/customers/favorites/${shopId}`),
  
  // Reviews
  createReview: (reviewData) => api.post('/customers/reviews', reviewData),
  updateReview: (reviewId, reviewData) => api.put(`/customers/reviews/${reviewId}`, reviewData),
};

// Barber API
export const barberAPI = {
  // Profile
  getProfile: () => api.get('/barbers/profile'),
  updateProfile: (profileData) => api.put('/barbers/profile', profileData),
  
  // Shops
  getShops: () => api.get('/barbers/shops'),
  createShop: (shopData) => api.post('/barbers/shops', shopData),
  updateShop: (shopId, shopData) => api.put(`/barbers/shops/${shopId}`, shopData),
  deleteShop: (shopId) => api.delete(`/barbers/shops/${shopId}`),
  
  // Bookings
  getBookings: (params) => api.get('/barbers/bookings', { params }),
  updateBooking: (bookingId, bookingData) => api.put(`/barbers/bookings/${bookingId}`, bookingData),
  
  // Earnings
  getEarnings: (params) => api.get('/barbers/earnings', { params }),
  
  // Services
  createService: (serviceData) => api.post('/barbers/services', serviceData),
  updateService: (serviceId, serviceData) => api.put(`/barbers/services/${serviceId}`, serviceData),
  deleteService: (serviceId) => api.delete(`/barbers/services/${serviceId}`),
};

// Admin API
export const adminAPI = {
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUsersByRole: (role) => api.get(`/admin/users/role/${role}`),
  getUser: (userId) => api.get(`/admin/users/${userId}`),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  
  // Shops
  getShops: (params) => api.get('/admin/shops', { params }),
  getShop: (shopId) => api.get(`/admin/shops/${shopId}`),
  updateShop: (shopId, shopData) => api.put(`/admin/shops/${shopId}`, shopData),
  deleteShop: (shopId) => api.delete(`/admin/shops/${shopId}`),
  
  // Analytics
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getRevenue: (params) => api.get('/admin/revenue', { params }),
  
  // Commission
  updateCommission: (shopId, commissionRate) => api.put(`/admin/commission/${shopId}`, { commissionRate }),
};

// Shared API (accessible to all users)
export const sharedAPI = {
  // Shops
  getShops: (params) => api.get('/shops', { params }),
  searchShops: (params) => api.get('/shops/search', { params }),
  getShop: (shopId) => api.get(`/shops/${shopId}`),
  getShopServices: (shopId) => api.get(`/shops/${shopId}/services`),
  getShopEmployees: (shopId) => api.get(`/shops/${shopId}/employees`),
  getShopAvailability: (shopId, params) => api.get(`/shops/${shopId}/availability`, { params }),
  getShopReviews: (shopId, params) => api.get(`/shops/${shopId}/reviews`, { params }),
  
  // Services
  getServices: (params) => api.get('/services', { params }),
  getServiceCategories: () => api.get('/services/categories'),
  getService: (serviceId) => api.get(`/services/${serviceId}`),
  
  // Barbers/Employees
  getBarbers: (params) => api.get('/barbers', { params }),
  getBarber: (barberId) => api.get(`/barbers/${barberId}`),
  
  // Appointments (shared endpoints)
  getAppointments: (params) => api.get('/appointments', { params }),
  getAppointment: (appointmentId) => api.get(`/appointments/${appointmentId}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 