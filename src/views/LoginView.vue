<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/UserStore'

// Import shadcn-vue components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

// Reactive variables for form fields and error messages
const email = ref('')
const password = ref('')
const userStore = useUserStore()
const errorMessage = ref('')

// Disable scrolling when the page is loaded
onMounted(() => {
  document.body.style.overflow = 'hidden'
})

// Re-enable scrolling when the page is unloaded
onUnmounted(() => {
  document.body.style.overflow = ''
})

/**
 * Handles the login process by verifying the user's credentials.
 * 
 * @async
 * @function handleLogin
 * @returns {Promise<void>} Resolves when the login process is complete.
 * @throws {Error} If the login fails, an error message is displayed.
 */
async function handleLogin() {
  try {
    errorMessage.value = ''
    await userStore.verifyLogin(email.value, password.value)
    alert($t('success.login-successful') as string)
  } catch (error) {
    errorMessage.value = $t('errors.login-failed') as string
    console.error('Login error:', error)
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-container">
        <h1 class="text-xl font-bold text-center mb-4">{{ $t('login.login') }}</h1>
        <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="form-group">
            <Label for="email" class="block text-sm font-medium">{{ $t('login.email') }}</Label>
            <Input
            id="email"
            type="email"
            v-model="email"
            :placeholder="$t('login.email')"
            required
            />
        </div>
        <div class="form-group">
            <Label for="password" class="block text-sm font-medium">{{ $t('login.password') }}</Label>
            <Input
            id="password"
            type="password"
            v-model="password"
            :placeholder="$t('login.password')"
            required
            />
        </div>
        <Button type="submit" class="w-full bg-primary text-white hover:bg-primary/90">
            {{ $t('login.login') }}
        </Button>
        <p v-if="errorMessage" class="error text-red-500 text-center mt-2">{{ errorMessage }}</p>
        </form>
    </div>
  </div>
</template>

<style scoped>
/* Wrapper styling to center the login form */
.login-wrapper {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100vh;
  background-color: var(--background-color);
  padding: 1rem;
}

/* Styling for the login form container */
.login-container {
  min-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: var(--background-color);
  color: var(--text-color);
}

/* Styling for error messages */
.error {
  margin-top: 10px;
}
</style>