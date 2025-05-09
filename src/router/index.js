import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/payment/success',
      name: 'payment-success',
      component: () => import('../views/PaymentSuccessView.vue'),
    },
    {
      path: '/payment/error',
      name: 'payment-error',
      component: () => import('../views/PaymentErrorView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Auth/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Auth/RegisterView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Auth/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrderHistoryView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/Admin/DashboardView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Auth/RegisterView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Auth/ProfileView.vue'),
    }
  ],

})

export default router
