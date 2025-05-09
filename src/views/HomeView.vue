<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Meal from '../services/meal.js';
import OrderForm from '../components/OrderForm.vue';
import MealModal from '../components/MealModal.vue';
import checkoutService from '../services/checkout.js';
import { useCartStore } from '../stores/cart';
import NavBar from '../components/NavBar.vue';

const router = useRouter();
const cartStore = useCartStore();

const meals = ref([]);
const filteredMeals = ref([]);
const showOrderForm = ref(false);
const selectedMeal = ref(null);
const showMealModal = ref(false);

onMounted(async () => {
  try {
    meals.value = await Meal.getAll();
    filteredMeals.value = meals.value;
  } catch (error) {
    console.error('Erreur lors du chargement des repas:', error);
  }
});

const searchMeals = (query) => {
  filteredMeals.value = meals.value.filter(meal =>
    meal.designation.toLowerCase().includes(query.toLowerCase()) ||
    meal.description.toLowerCase().includes(query.toLowerCase())
  );
};

const formatPrice = cartStore.formatPrice;

const addToCart = (meal) => {
  cartStore.addItem(meal);
};

const view = (meal) => {
  selectedMeal.value = meal;
  showMealModal.value = true;
};

const handleOrderSubmit = async (orderDetails) => {
  try {
    await checkoutService.createCheckoutSession(cartStore.total);
  } catch (error) {
    console.error('Erreur lors du processus de paiement:', error);
    router.push('/payment/error');
  }
};
</script>

<template>
  <div class="home">
    <NavBar @search="searchMeals" />
    <div v-if="cartStore.showCart" class="cart-panel">
      <h3>Mon Panier</h3>
      <div v-if="cartStore.items.length > 0" class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <img :src="item.imagePath" :alt="item.designation" class="cart-item-image">
          <div class="cart-item-details">
            <h4>{{ item.designation }}</h4>
            <p>{{ formatPrice(item.price) }} x {{ item.quantity }}</p>
          </div>
        </div>
        <div class="cart-total">
          <h4>Total: {{ formatPrice(cartStore.total) }}</h4>
          <button class="checkout-button" @click="showOrderForm = true; cartStore.toggleCart()">Commander</button>
        </div>
      </div>
      <div v-else class="empty-cart">
        Votre panier est vide
      </div>
    </div>


    <OrderForm
      v-if="showOrderForm"
      :cart-items="cartStore.items"
      :total="cartStore.total"
      @submit-order="handleOrderSubmit"
      @close="showOrderForm = false"
    />

    <MealModal
      v-if="showMealModal"
      :meal="selectedMeal"
      :show="showMealModal"
      @close="showMealModal = false"
    />

    <div class="menu-box">
      <div class="menu-item" v-for="(meal, index) in filteredMeals" :key="index">
        <div class="menu-card">
          <div class="menu-card-image">
            <img :src="meal.imagePath" alt="Meal Image" class="meal-image">
          </div>     
          <div class="menu-card-content">
            <div class="product-title">
              <h3>{{ meal.designation }}</h3>
              <span v-if="meal.availability === 0" class="stock-badge">Rupture</span>
            </div>
            <p>Prix: {{ formatPrice(meal.price) }}</p>
          </div>  
          <div class="menu-footer">
            <button @click="addToCart(meal)">ajouter</button>
            <button @click="view(meal)">plus</button>
          </div> 
        </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.search-bar {
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 500px;
  padding: var(--spacing-md);
  border: var(--border-width) var(--border-style) var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  transition: all var(--transition-duration) var(--transition-timing);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}



.menu-box {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.menu-card {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: var(--border-width) var(--border-style) var(--border-color);
  position: relative;
}

.menu-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.menu-card:active {
  transform: translateY(-2px) scale(0.98);
}

.menu-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.menu-card:hover::before {
  opacity: 1;
}

.menu-card-image {
  height: 220px;
  overflow: hidden;
  position: relative;
}

.menu-card-image::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to top, rgba(255,255,255,0.8), transparent);
}

.meal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-duration) var(--transition-timing);
}

.menu-card:hover .meal-image {
  transform: scale(1.05);
}

.menu-card-content {
  padding: var(--spacing-lg);
}

.product-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.product-title h3 {
  margin: 0;
  color: var(--gray-500);
  font-size: 1.25rem;
}

.stock-badge {
  background-color: var(--danger);
  color: var(--white);
  padding: 2px 8px;
  border-radius: var(--border-radius);
  font-size: 0.75rem;
  font-weight: 500;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.menu-card-content p {
  margin: var(--spacing-xs) 0;
  color: var(--gray-400);
  line-height: 1.6;
}

.menu-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-sm);
  background-color: var(--gray-100);
}

.menu-footer button {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: capitalize;
  transition: all var(--transition-duration) var(--transition-timing);
}

.menu-footer button:first-child {
  background-color: var(--orange-300);
  color: var(--white);
}

.menu-footer button:last-child {
  background-color: var(--orange-400);
  color: var(--white);
}

.menu-footer button {
  position: relative;
  overflow: hidden;
}

.menu-footer button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.5s;
}

.menu-footer button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.menu-footer button:hover::after {
  transform: translate(-50%, -50%) scale(2);
}

.menu-footer button:active::after {
  transform: translate(-50%, -50%) scale(1.5);
  opacity: 0.5;
}

.cart-widget {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  background-color: var(--primary);
  color: var(--white);
  padding: var(--spacing-md);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  z-index: 1000;
  transition: all var(--transition-duration) var(--transition-timing);
}

.cart-widget {
  transform-origin: center;
}

.cart-widget:hover {
  transform: scale(1.1) rotate(5deg);
  background-color: var(--orange-400);
  animation: wiggle 0.3s ease-in-out;
}

@keyframes wiggle {
  0%, 100% { transform: scale(1.1) rotate(5deg); }
  25% { transform: scale(1.1) rotate(10deg); }
  75% { transform: scale(1.1) rotate(0deg); }
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--danger);
  color: var(--white);
  border-radius: 50%;
  padding: 4px 8px;
  font-size: 0.75rem;
  min-width: 20px;
  text-align: center;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.cart-panel {
  position: fixed;
  top: calc(var(--spacing-lg) * 4);
  right: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--border-radius);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-lg);
  width: 350px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 999;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.cart-panel h3 {
  color: var(--gray-500);
  font-size: 1.25rem;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: var(--border-width) var(--border-style) var(--border-color);
}

.cart-items {
  margin-top: var(--spacing-md);
}

.cart-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  border-bottom: var(--border-width) var(--border-style) var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  opacity: 1;
}

.cart-item:hover {
  padding-left: var(--spacing-sm);
  background: rgba(var(--primary-rgb), 0.05);
}

.cart-item.removing {
  transform: translateX(100%);
  opacity: 0;
}

.cart-item:hover {
  background-color: var(--gray-100);
}

.cart-item-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.cart-item-details {
  flex: 1;
}

.cart-item-details h4 {
  margin: 0;
  color: var(--gray-500);
  font-size: 1rem;
  font-weight: 500;
}

.cart-item-details p {
  margin: var(--spacing-xs) 0;
  color: var(--gray-400);
  font-size: 0.875rem;
}

.cart-total {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: var(--border-width) var(--border-style) var(--border-color);
}

.cart-total h4 {
  color: var(--gray-500);
  font-size: 1.1rem;
  margin-bottom: var(--spacing-sm);
}

.checkout-button {
  width: 100%;
  padding: var(--spacing-md);
  background-color: var(--success);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  margin-top: var(--spacing-sm);
  font-weight: 500;
  transition: all var(--transition-duration) var(--transition-timing);
}

.checkout-button {
  position: relative;
  overflow: hidden;
}

.checkout-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: 0.5s;
}

.checkout-button:hover {
  background-color: var(--green-400);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.checkout-button:hover::before {
  left: 100%;
}

.checkout-button:active {
  transform: translateY(0);
}

.empty-cart {
  text-align: center;
  color: var(--gray-400);
  font-style: italic;
  padding: var(--spacing-lg);
}

@media (max-width: 768px) {
  .menu-box {
    grid-template-columns: 1fr;
    padding: var(--spacing-sm);
    gap: var(--spacing-md);
  }

  .cart-panel {
    width: 90%;
    right: 5%;
    top: 50%;
    transform: translateY(-50%);
    max-height: 90vh;
  }

  .search-bar {
    width: 95%;
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    flex-direction: column;
    gap: var(--spacing-xs);
    background: rgba(255, 255, 255, 0.9);
  }

  .search-bar input {
    width: 100%;
    font-size: var(--font-size-sm);
    padding: var(--spacing-sm);
  }

  .search-bar button {
    width: 100%;
    padding: var(--spacing-sm);
    font-size: var(--font-size-sm);
  }

  .menu-card {
    margin: 0;
  }

  .menu-card-image {
    height: 180px;
  }

  .menu-card-content {
    padding: var(--spacing-md);
  }

  .menu-card-content h3 {
    font-size: 1.1rem;
  }

  .menu-card-content p {
    font-size: 0.9rem;
  }

  .menu-footer {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .menu-footer button {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.8rem;
  }

  .cart-widget {
    bottom: var(--spacing-lg);
    top: auto;
    right: var(--spacing-lg);
  }
}
</style>
