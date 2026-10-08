import axios from 'axios';

// Setup base Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api', // Preparing for Spring Boot (or FastAPI) integration
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach tokens if needed later
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock service delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Mock Login
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/login', {
        username: credentials.email, // login field is used as username
        password: credentials.password,
      });
      const data = response.data;
      if (data.success) {
        localStorage.setItem('user_id', String(data.user_id));
        localStorage.setItem('username', data.username || credentials.email);
        localStorage.setItem('auth_token', 'authenticated');
        return data;
      }
      throw new Error('Login failed');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Invalid username or password';
      throw new Error(msg);
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/register', {
        username: userData.username,
        password: userData.password,
      });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Registration failed';
      throw new Error(msg);
    }
  },

  // Mock Forgot Password
  forgotPassword: async (email) => {
    // Future: return apiClient.post('/forgot-password', { email });
    await delay(1200);
    return {
      success: true,
      message: 'If an account exists with that email, we have sent a reset link.'
    };
  },

  // Mock Reset Password
  resetPassword: async (token, newPassword) => {
    // Future: return apiClient.post('/reset-password', { token, newPassword });
    await delay(1200);
    return {
      success: true,
      message: 'Password successfully reset. You can now login.'
    };
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
  }
};
