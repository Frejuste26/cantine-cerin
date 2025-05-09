import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8086';

// Configuration d'Axios avec le token
const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Validation du token
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

export default {
  setAuthHeader,
  isTokenValid,
  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  },

  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        customerId: userData.customerId,
        username: userData.username,
        password: userData.password
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  },

  async getCurrentUser() {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  },

  async updateProfile(userData) {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  },

  async resetPassword(email) {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
    }
  }
};