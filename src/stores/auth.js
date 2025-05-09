import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '@/services/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token'));
  const isAuthenticated = computed(() => !!token.value && authService.isTokenValid(token.value));
  const isAdmin = computed(() => user.value?.role === 'admin');

  // Initialisation de la session
  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && authService.isTokenValid(storedToken)) {
      setToken(storedToken);
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        logout();
      }
    } else {
      logout();
    }
  };

  function setUser(userData) {
    user.value = userData;
  }

  function setToken(tokenValue) {
    token.value = tokenValue;
    if (tokenValue) {
      localStorage.setItem('token', tokenValue);
      authService.setAuthHeader(tokenValue);
    } else {
      localStorage.removeItem('token');
      authService.setAuthHeader(null);
    }
  }

  function logout() {
    user.value = null;
    setToken(null);
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    setUser,
    setToken,
    logout,
    initializeAuth
  };
});