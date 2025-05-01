<script setup lang="ts">
import { ref, h } from 'vue'
import { useForm } from 'vee-validate'
import { useUserStore } from '@/stores/UserStore'
import { useI18n } from 'vue-i18n'
import { AxiosError } from 'axios' // Import AxiosError type
import * as z from 'zod'

const { t } = useI18n()

// Import shadcn-vue components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogDescription,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import router from '@/router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { CardContent, Card, CardHeader, CardTitle } from '@/components/ui/card'
import { PinInputGroup, PinInputInput, PinInput } from '@/components/ui/pin-input'
import { toTypedSchema } from '@vee-validate/zod'

// Reactive variables for form fields and error messages
const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const isView = ref(false)
const userStore = useUserStore()
const errorMessage = ref('')

// Define the validation schema using zod
const resetPasswordSchema = toTypedSchema(
  z.object({
    token: z.string().nonempty(t('errors.token-required')),
    password: z
      .string()
      .min(8, t('errors.password-too-short'))
      .regex(/[A-Z]/, t('errors.password-uppercase'))
      .regex(/[0-9]/, t('errors.password-number')),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('errors.passwords-do-not-match'),
    path: ['confirmPassword'],
  })
)

// Initialize the form with vee-validate
const form = useForm({
  validationSchema: resetPasswordSchema,
  initialValues: {
    token: '',
    password: '',
    confirmPassword: '',
  },
})

/**
 * Handles the login process by verifying the user's credentials.
 *
 * @async
 * @function handleReset
 * @returns {Promise<void>} Resolves when the login process is complete.
 * @throws {Error} If the login fails, an error message is displayed.
 */
async function handleReset() {
  try {
    errorMessage.value = ''
    const response = await userStore.verifyLogin(token.value, password.value)

    // Check HTTP status code
    if (response.status === 200) {
      userStore.login(response.status, response.data.token, token.value)
      router.push('/')
    } else if (response.status === 202) {
      // If the response status is 202, it indicates that 2FA is required
    } else {
      errorMessage.value = t('errors.unexpected-error')
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status
      if (status === 401) {
        errorMessage.value = t('errors.invalid-credentials')
      } else if (status === 403) {
        errorMessage.value = t('errors.account-locked')
      } else {
        errorMessage.value = t('errors.unexpected-error')
      }
    } else {
      errorMessage.value = t('errors.network-error')
    }
    console.error('Login error:', error)
  }
}


</script>

<template>
  <div class="login-wrapper">
    <Card class="min-w-[20vw]">
      <CardHeader>
        <CardTitle class="text-xl font-bold text-center">{{ $t('reset-password.title') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleReset" class="space-y-4">
          <div class="form-group">
            <Label for="token" class="block text-sm font-medium">{{ $t('reset-password.code') }}</Label>
            <Input
              id="token"
              type="text"
              v-model="token"
              :placeholder="$t('reset-password.code')"
              required
            />
          </div>
          <div class="form-group">
            <Label for="password" class="block text-sm font-medium">{{
                $t('reset-password.new-password')
              }}</Label>
            <div class="relative">
              <!-- Password Input -->
              <Input
                :type="isView ? 'text' : 'password'"
                id="password"
                v-model="password"
                class="input-lead w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                :placeholder="t('reset-password.new-password')"
              />
              <!-- Toggle Icon -->
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-transparent dark:hover:bg-transparent"
                @click="isView = !isView"
              >
                <component :is="isView ? EyeOff : Eye" class="h-5 w-5" />
              </Button>
            </div>


          </div>
          <div class="form-group">
            <Label for="confirmPassword" class="block text-sm font-medium">{{
                t('reset-password.confirm-new-password')
              }}</Label>
            <div class="relative">
              <!-- Password Input -->
              <Input
                :type="isView ? 'text' : 'password'"
                id="confirmPassword"
                v-model="confirmPassword"
                class="input-lead w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                :placeholder="t('reset-password.confirm-new-password')"
              />
              <!-- Toggle Icon -->
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-transparent dark:hover:bg-transparent"
                @click="isView = !isView"
              >
                <component :is="isView ? EyeOff : Eye" class="h-5 w-5" />
              </Button>
            </div>


          </div>

          <Button type="submit" class="w-full bg-primary hover:bg-primary/90"
                  @click="
                        () => {
                          toast(t('reset-password.new-password'), {
                            description:
                              t('reset-password.password-updated'),
                          })
                        }
                      ">
            {{ $t('reset-password.title') }}
          </Button>
          <p v-if="errorMessage" class="error text-red text-center mt-2">{{ errorMessage }}</p>
        </form>
      </CardContent>
    </Card>

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
  border-radius: 8px;
  background-color: var(--background-color);
  color: var(--text-color);
}

/* Styling for error messages */
.error {
  margin-top: 10px;
}
</style>
