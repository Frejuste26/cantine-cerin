<script setup>
import { ref } from 'vue'

const userData = ref({
  lastname: 'Doe',
  firstname: 'John',
  phone: '+33 6 12 34 56 78',
  email: 'john.doe@example.com',
  username: 'johndoe'
})
</script>

<template>
  <main id="profile-container">
    <h1>Mon Profil</h1>

    <div class="profile-section">
      <h3>Informations personnelles</h3>
      <div class="info-group">
        <label>Nom</label>
        <p>{{ userData.lastname }}</p>
      </div>
      <div class="info-group">
        <label>Prénom</label>
        <p>{{ userData.firstname }}</p>
      </div>
    </div>

    <div class="profile-section">
      <h3>Coordonnées</h3>
      <div class="info-group">
        <label>Téléphone</label>
        <p>{{ userData.phone }}</p>
      </div>
      <div class="info-group">
        <label>Email</label>
        <p>{{ userData.email }}</p>
      </div>
    </div>

    <div class="profile-section">
      <h3>Identifiants</h3>
      <div class="info-group">
        <label>Nom d'utilisateur</label>
        <p>{{ userData.username }}</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
#profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.profile-section {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.info-group {
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}

.info-group label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.info-group p {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0;
}
</style>