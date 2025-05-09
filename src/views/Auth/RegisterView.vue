<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import customerService from '@/services/customer';
import authService from '@/services/auth';

const router = useRouter();
const currentStep = ref(1);
const isLoading = ref(false);
const error = ref('');

const formData = ref({
  lastname: '',
  firstname: '',
  phone: '',
  email: '',
  username: '',
  password: ''
});

// Validation des champs
const lastnameError = computed(() => {
  if (!formData.value.lastname) return '';
  return formData.value.lastname.length < 2 ? 'Le nom doit contenir au moins 2 caractères' : '';
});

const firstnameError = computed(() => {
  if (!formData.value.firstname) return '';
  return formData.value.firstname.length < 2 ? 'Le prénom doit contenir au moins 2 caractères' : '';
});

const phoneError = computed(() => {
  if (!formData.value.phone) return '';
  const phoneRegex = /^[0-9]{10}$/;
  return !phoneRegex.test(formData.value.phone) ? 'Numéro de téléphone invalide' : '';
});

const emailError = computed(() => {
  if (!formData.value.email) return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !emailRegex.test(formData.value.email) ? 'Adresse email invalide' : '';
});

const usernameError = computed(() => {
  if (!formData.value.username) return '';
  return formData.value.username.length < 3 ? 'Le nom d\'utilisateur doit contenir au moins 3 caractères' : '';
});

const passwordError = computed(() => {
  if (!formData.value.password) return '';
  return formData.value.password.length < 6 ? 'Le mot de passe doit contenir au moins 6 caractères' : '';
});

const isStep1Valid = computed(() => {
  return formData.value.lastname && formData.value.firstname && 
         formData.value.phone && formData.value.email &&
         !lastnameError.value && !firstnameError.value && 
         !phoneError.value && !emailError.value;
});

const isStep2Valid = computed(() => {
  return formData.value.username && formData.value.password &&
         !usernameError.value && !passwordError.value;
});

const nextStep = async () => {
  if (!isStep1Valid.value) return;
  
  try {
    isLoading.value = true;
    error.value = '';
    
    // Créer le client
    const customerResponse = await customerService.createCustomer({
      lastname: formData.value.lastname,
      firstname: formData.value.firstname,
      phone: formData.value.phone,
      email: formData.value.email
    });
    
    // Récupérer le customerId
    const customerData = await customerService.getCustomerByEmail(formData.value.email);
    formData.value.customerId = customerData.id;
    
    currentStep.value = 2;
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

const register = async () => {
  if (!isStep2Valid.value) return;
  
  try {
    isLoading.value = true;
    error.value = '';
    
    await authService.register({
      customerId: formData.value.customerId,
      username: formData.value.username,
      password: formData.value.password
    });
    
    router.push('/login');
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="register-container">
    <h2 class="text-2xl font-bold mb-6">Inscription</h2>
    
    <!-- Indicateur de progression -->
    <div class="steps-indicator mb-6">
      <div class="step" :class="{ 'active': currentStep >= 1, 'complete': currentStep > 1 }">
        <div class="step-number">1</div>
        <div class="step-label">Informations</div>
      </div>
      <div class="step" :class="{ 'active': currentStep === 2 }">
        <div class="step-number">2</div>
        <div class="step-label">Compte</div>
      </div>
    </div>
    
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>
    
    <!-- Étape 1 : Informations personnelles -->
    <form v-if="currentStep === 1" @submit.prevent="nextStep" class="space-y-4">
      <div class="form-group">
        <label for="lastname" class="block mb-1">Nom</label>
        <input
          type="text"
          id="lastname"
          v-model="formData.lastname"
          class="w-full px-3 py-2 border rounded"
          :class="{ 'border-red-500': lastnameError }"
          required
        >
        <span v-if="lastnameError" class="text-red-500 text-sm">{{ lastnameError }}</span>
      </div>
      
      <div class="form-group">
        <label for="firstname" class="block mb-1">Prénom</label>
        <input
          type="text"
          id="firstname"
          v-model="formData.firstname"
          class="w-full px-3 py-2 border rounded"
          :class="{ 'border-red-500': firstnameError }"
          required
        >
        <span v-if="firstnameError" class="text-red-500 text-sm">{{ firstnameError }}</span>
      </div>
      
      <div class="form-group">
        <label for="phone" class="block mb-1">Téléphone</label>
        <input
          type="tel"
          id="phone"
          v-model="formData.phone"
          class="w-full px-3 py-2 border rounded"
          :class="{ 'border-red-500': phoneError }"
          required
        >
        <span v-if="phoneError" class="text-red-500 text-sm">{{ phoneError }}</span>
      </div>
      
      <div class="form-group">
        <label for="email" class="block mb-1">Email</label>
        <input
          type="email"
          id="email"
          v-model="formData.email"
          class="w-full px-3 py-2 border rounded"
          :class="{ 'border-red-500': emailError }"
          required
        >
        <span v-if="emailError" class="text-red-500 text-sm">{{ emailError }}</span>
      </div>
      
      <button
        type="submit"
        class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        :disabled="!isStep1Valid || isLoading"
      >
        {{ isLoading ? 'Chargement...' : 'Suivant' }}
      </button>
    </form>
    
    <!-- Étape 2 : Création du compte -->
    <form v-else @submit.prevent="register" class="space-y-4">
      <div class="form-group">
        <label for="username" class="block mb-1">Nom d'utilisateur</label>
        <input
          type="text"
          id="username"
          v-model="formData.username"
          class="w-full px-3 py-2 border rounded"
          :class="{ 'border-red-500': usernameError }"
          required
        >
        <span v-if="usernameError" class="text-red-500 text-sm">{{ usernameError }}</span>
      </div>
      
      <div class="form-group">
        <label for="password" class="block mb-1">Mot de passe</label>
        <input
          type="password"
          id="password"
          v-model="formData.password"
          class="w-full px-3 py-2 border rounded"
          :class="{ 'border-red-500': passwordError }"
          required
        >
        <span v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</span>
      </div>
      
      <button
        type="submit"
        class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        :disabled="!isStep2Valid || isLoading"
      >
        {{ isLoading ? 'Chargement...' : 'S\'inscrire' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.register-container {
  max-width: 480px;
  margin: var(--spacing-xl) auto;
  padding: var(--spacing-xl);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all var(--transition-duration) var(--transition-timing);
}

.register-container:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

label {
  color: var(--gray-500);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}

input {
  transition: all var(--transition-duration) var(--transition-timing);
  border: var(--border-width) var(--border-style) rgba(209, 213, 219, 0.5);
  font-size: var(--font-size-md);
  background-color: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(4px);
  padding: 0.75rem 1rem;
}

input:focus {
  outline: none;
  border-color: var(--primary);
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.2);
  transform: translateY(-1px);
}

input.border-red-500 {
  border-color: var(--danger);
}

.text-red-500 {
  color: var(--danger);
}

button {
  background-color: var(--primary);
  font-weight: var(--font-weight-bold);
  transition: all var(--transition-duration) var(--transition-timing);
  position: relative;
  overflow: hidden;
  padding: 0.75rem 1.5rem;
  border: none;
  z-index: 1;
}

button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease-out, height 0.6s ease-out;
  z-index: -1;
}

button:hover:not(:disabled) {
  background-color: var(--orange-400);
  transform: translateY(-2px);
}

button:hover:not(:disabled)::before {
  width: 300px;
  height: 300px;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Animation des étapes */
.space-y-4 {
  animation: fadeIn var(--transition-duration) var(--transition-timing);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Styles de l'indicateur de progression */
.steps-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding: 0 var(--spacing-md);
}

.steps-indicator::before {
  content: '';
  position: absolute;
  top: 25px;
  left: 50px;
  right: 50px;
  height: 2px;
  background-color: var(--gray-200);
  z-index: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--gray-200);
  color: var(--gray-500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 2px solid transparent;
}

.step-number::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: all 0.4s ease;
}

.step-label {
  font-size: var(--font-size-sm);
  color: var(--gray-400);
  transition: color var(--transition-duration) var(--transition-timing);
}

.step.active .step-number {
  background-color: var(--primary);
  color: var(--white);
  transform: scale(1.1);
}

.step.active .step-number::after {
  border-color: var(--primary);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.3);
    opacity: 0;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.step.active .step-label {
  color: var(--primary);
  font-weight: var(--font-weight-bold);
}

.step.complete .step-number {
  background-color: var(--success);
  color: var(--white);
}

.step.complete .step-label {
  color: var(--success);
}

</style>