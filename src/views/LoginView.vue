<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/UserStore'

const email = ref('')
const password = ref('')
const userStore = useUserStore()
const errorMessage = ref('')

async function handleLogin() {
  try {
    errorMessage.value = ''
    await userStore.verifyLogin(email.value, password.value)
    alert('Login successful!')
  } catch (error) {
    errorMessage.value = 'Login failed. Please check your credentials.'
    console.error('Login error:', error)
  }
}
</script>

<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          v-model="email"
          placeholder="Enter your email"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          v-model="password"
          placeholder="Enter your password"
          required
        />
      </div>
      <button type="submit">Login</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: var(--background-color);
  color: var(--text-color);
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: var(--third-color);
}

.error {
  color: var(--red-text-color);
  margin-top: 10px;
  text-align: center;
}
</style>