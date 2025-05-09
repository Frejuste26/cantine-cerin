<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import Meal from '@/services/meal';

const authStore = useAuthStore();
const router = useRouter();

const meals = ref([]);
const orders = ref([]);
const activeTab = ref('meals');
const isLoading = ref(false);
const error = ref(null);

onMounted(async () => {
  if (!authStore.isAdmin) {
    router.push('/');
    return;
  }

  try {
    isLoading.value = true;
    meals.value = await Meal.getAll();
    // TODO: Implémenter la récupération des commandes
    // orders.value = await Order.getAll();
  } catch (err) {
    error.value = 'Erreur lors du chargement des données';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});

const deleteMeal = async (mealId) => {
  try {
    await Meal.delete(mealId);
    meals.value = meals.value.filter(meal => meal.id !== mealId);
  } catch (err) {
    error.value = 'Erreur lors de la suppression du plat';
    console.error(err);
  }
};
</script>

<template>
  <div class="admin-dashboard">
    <h1>Tableau de Bord Administrateur</h1>

    <div class="tabs">
      <button 
        :class="['tab-button', { active: activeTab === 'meals' }]"
        @click="activeTab = 'meals'"
      >
        Gestion des Plats
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'orders' }]"
        @click="activeTab = 'orders'"
      >
        Gestion des Commandes
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="isLoading" class="loading">
      Chargement...
    </div>

    <div v-else>
      <!-- Gestion des Plats -->
      <div v-if="activeTab === 'meals'" class="meals-management">
        <div class="actions">
          <button class="add-button" @click="router.push('/admin/meals/new')">
            Ajouter un Plat
          </button>
        </div>

        <div class="meals-list">
          <div v-for="meal in meals" :key="meal.id" class="meal-item">
            <img :src="meal.image" :alt="meal.designation" class="meal-image">
            <div class="meal-details">
              <h3>{{ meal.designation }}</h3>
              <p>{{ meal.description }}</p>
              <p class="price">Prix: {{ meal.price }} XOF</p>
            </div>
            <div class="meal-actions">
              <button @click="router.push(`/admin/meals/${meal.id}/edit`)">
                Modifier
              </button>
              <button class="delete" @click="deleteMeal(meal.id)">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Gestion des Commandes -->
      <div v-if="activeTab === 'orders'" class="orders-management">
        <div class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-item">
            <div class="order-header">
              <h3>Commande #{{ order.id }}</h3>
              <span :class="['status', order.status]">{{ order.status }}</span>
            </div>
            <div class="order-details">
              <p>Client: {{ order.user.name }}</p>
              <p>Date: {{ new Date(order.createdAt).toLocaleString() }}</p>
              <p>Total: {{ order.total }} XOF</p>
            </div>
            <div class="order-items">
              <h4>Articles:</h4>
              <ul>
                <li v-for="item in order.items" :key="item.id">
                  {{ item.quantity }}x {{ item.meal.designation }}
                </li>
              </ul>
            </div>
            <div class="order-actions">
              <button 
                v-if="order.status === 'pending'"
                @click="updateOrderStatus(order.id, 'processing')"
              >
                Traiter
              </button>
              <button 
                v-if="order.status === 'processing'"
                @click="updateOrderStatus(order.id, 'completed')"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.tab-button {
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--gray-200);
  cursor: pointer;
  transition: all var(--transition-duration) var(--transition-timing);
}

.tab-button.active {
  background-color: var(--primary);
  color: var(--white);
}

.error-message {
  color: var(--danger);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  border-radius: var(--border-radius);
  background-color: var(--danger-light);
}

.loading {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--gray-400);
}

.actions {
  margin-bottom: var(--spacing-lg);
}

.add-button {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--success);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-duration) var(--transition-timing);
}

.add-button:hover {
  background-color: var(--success-dark);
}

.meals-list, .orders-list {
  display: grid;
  gap: var(--spacing-lg);
}

.meal-item, .order-item {
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.meal-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.meal-details, .order-details {
  flex: 1;
}

.meal-actions, .order-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.meal-actions button, .order-actions button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-duration) var(--transition-timing);
}

.meal-actions button.delete {
  background-color: var(--danger);
  color: var(--white);
}

.status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
}

.status.pending {
  background-color: var(--warning-light);
  color: var(--warning);
}

.status.processing {
  background-color: var(--info-light);
  color: var(--info);
}

.status.completed {
  background-color: var(--success-light);
  color: var(--success);
}

@media (max-width: 768px) {
  .meal-item, .order-item {
    flex-direction: column;
  }

  .meal-image {
    width: 100%;
    height: 200px;
  }

  .meal-actions, .order-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>