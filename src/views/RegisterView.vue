<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/UserStore'

// Import shadcn-vue components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useI18n } from 'vue-i18n'

// Initialize i18n
const { t } = useI18n()

// Reactive variables for form fields and error messages
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
// Error and success messages
const errorMessage = ref('')
const successMessage = ref('')

// Access the UserStore to handle registration logic
const userStore = useUserStore()

// // Disable scrolling when the page is loaded
// onMounted(() => {
//   document.body.style.overflow = 'hidden'
// })

// // Re-enable scrolling when the page is unloaded
// onUnmounted(() => {
//   document.body.style.overflow = ''
// })

/**
 * Handles the registration process by sending user details to the backend.
 *
 * @async
 * @function handleRegister
 * @returns {Promise<void>} Resolves when the registration process is complete.
 * @throws {Error} If the registration fails, an error message is displayed.
 */
async function handleRegister() {
  try {
    errorMessage.value = ''
    successMessage.value = ''

    // Check if passwords match
    if (password.value !== confirmPassword.value) {
      errorMessage.value = t('errors.passwords-do-not-match') as string
      return
    }

    // Call the UserStore's register method
    await userStore.registerUser({
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
      phoneNumber: phone.value,
    })

    successMessage.value = t('success.registration-successful') as string
    // Optionally, redirect to the login page
  } catch (error) {
    errorMessage.value = t('errors.registration-failed') as string
    console.error('Registration error:', error)
  }
}
</script>

<template>
  <div class="register-wrapper">
    <div class="register-container">
      <h1 class="text-xl font-bold text-center mb-4">{{ t('login.signup') }}</h1>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- First Name Field -->
        <div class="form-group">
          <Label for="firstName" class="block text-sm font-medium">{{
            t('login.first-name')
          }}</Label>
          <Input
            id="firstName"
            type="text"
            v-model="firstName"
            :placeholder="t('login.first-name')"
            required
          />
        </div>

        <!-- Last Name Field -->
        <div class="form-group">
          <Label for="lastName" class="block text-sm font-medium">{{ t('login.last-name') }}</Label>
          <Input
            id="lastName"
            type="text"
            v-model="lastName"
            :placeholder="t('login.last-name')"
            required
          />
        </div>

        <!-- Email Field -->
        <div class="form-group">
          <Label for="email" class="block text-sm font-medium">{{ t('login.email') }}</Label>
          <Input id="email" type="email" v-model="email" :placeholder="t('login.email')" required />
        </div>

        <!-- Phone Field -->
        <div class="form-group">
          <Label for="phone" class="block text-sm font-medium">{{ t('login.phone') }}</Label>
          <Input id="phone" type="tel" v-model="phone" :placeholder="t('login.phone')" required />
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <Label for="password" class="block text-sm font-medium">{{ t('login.password') }}</Label>
          <Input
            id="password"
            type="password"
            v-model="password"
            :placeholder="t('login.password')"
            required
          />
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group">
          <Label for="confirmPassword" class="block text-sm font-medium">{{
            t('login.confirm-password')
          }}</Label>
          <Input
            id="confirmPassword"
            type="password"
            v-model="confirmPassword"
            :placeholder="t('login.confirm-password')"
            required
          />
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          class="w-full bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-black dark:hover:bg-primary/80"
        >
          {{ t('login.signup') }}
        </Button>

        <!-- Success Message -->
        <p v-if="successMessage" class="success text-green-500 text-center mt-2">
          {{ successMessage }}
        </p>

        <!-- Error Message -->
        <p v-if="errorMessage" class="error text-red-500 text-center mt-2">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Wrapper styling to center the registration form */
.register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full viewport height */
  background-color: var(--background-color); /* Use a background color variable */
  padding: 1rem;
}

/* Styling for the registration form container */
.register-container {
  min-width: 30vw;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: var(--background-color);
  color: var(--text-color);
}

/* Styling for error and success messages */
.error {
  margin-top: 10px;
}

.success {
  margin-top: 10px;
}
</style>
