import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const showCart = ref(false);

  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });

  const itemCount = computed(() => {
    return items.value.reduce((count, item) => count + item.quantity, 0);
  });

  function addItem(meal) {
    const existingItem = items.value.find(item => item.id === meal.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      items.value.push({
        ...meal,
        quantity: 1
      });
    }
  }

  function toggleCart() {
    showCart.value = !showCart.value;
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price);
  }

  return {
    items,
    showCart,
    total,
    itemCount,
    addItem,
    toggleCart,
    formatPrice
  };
});