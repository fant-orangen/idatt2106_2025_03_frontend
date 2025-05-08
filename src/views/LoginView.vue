<script setup lang="ts">

/**
 * @component LoginView
 * @description Handles the user login flow including:
 * - reCaptcha
 * - login with email and password
 * - 2FA via email
 * - password reset dialog
 *
 * Uses the UserStore for authentication.
 */

import { ref } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useI18n } from 'vue-i18n'
import { AxiosError } from 'axios' // Import AxiosError type

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
import { sendPasswordResetEmail } from '@/services/UserService.ts'

/**
 * Reactive variables for form fields and error messages.
 */

const email = ref('')
const password = ref('')
const isView = ref(false)
const userStore = useUserStore()
const errorMessage = ref('')
const resetEmail = ref('')
const isTwoFactorAuthDialogOpen = ref(false)
const pinValue = ref<string[]>([])


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
    console.log('Executing reCAPTCHA...')

    // Generate the reCAPTCHA token
    const recaptchaToken = await new Promise<string>((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute('6Lee4CorAAAAABwb4TokgKDs9GdFCxpaiZTKfkfQ', {
            action: 'LOGIN',
          })
          .then((token: string) => {
            console.log('reCAPTCHA Token:', token)
            if (!token) {
              reject(new Error('Failed to generate reCAPTCHA token'))
            } else {
              resolve(token)
            }
          })
          .catch((error: unknown) => reject(error))
      })
    })

    console.log('This is the token being sent:', recaptchaToken)

    // Verify the login credentials
    const response = await userStore.verifyLogin(email.value, password.value, recaptchaToken)

    // Handle the response
    if (response.status === 200) {
      await userStore.login(response.status, response.data.token, email.value);
      router.push('/')
    } else if (response.status === 202) {
      userStore.send2FACodeToEmail(email.value)
      isTwoFactorAuthDialogOpen.value = true
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

/**
 * Handles the completion of the 2FA code input.
 *
 * @async
 * @function handleComplete
 * @returns {Promise<void>} Resolves when the 2FA verification is complete.
 * @throws {Error} If the verification fails, an error message is displayed.
 */
async function handleComplete() {
  try {
    console.log('Pin value:', Number(pinValue.value.join('')))
    const pinAsNumber = Number(pinValue.value.join(''))
    console.log('Pin as number:', pinAsNumber)
    const response = await userStore.verify2FACodeInput(email.value, pinAsNumber)
    if (response.status === 200) {
      isTwoFactorAuthDialogOpen.value = false
      await userStore.login(response.status, response.data.token, email.value);
      router.push('/')
    } else {
      errorMessage.value = t('errors.invalid-2fa-code')
    }
    console.log('User role is: ', userStore.role)
  } catch (error) {
    errorMessage.value = t('errors.login-failed')
    console.log('Login error', error)
  }
}

/**
 * Handle the password reset request.
 */
async function handleResetPassword() {
  try {
    await sendPasswordResetEmail(resetEmail.value)
    toast.success(t('reset-password.email-sent'))
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status
      if (status === 400) {
        errorMessage.value = t('errors.invalid-email')
      } else {
        errorMessage.value = t('errors.unexpected-error')
      }
    } else {
      errorMessage.value = t('errors.network-error')
    }
  }
}
</script>

<template>
  <!-- Wrapper for login page layout -->
  <div class="login-wrapper flex mt-[10vh] justify-center items-center bg-backround p-[1rem]">
    <Card class="min-w-5/6 md:min-w-xl">

      <!-- Header with page title -->
      <CardHeader>
        <CardTitle class="text-xl font-bold text-center">{{ $t('login.login') }}</CardTitle>
      </CardHeader>

      <!-- Login form -->
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">

          <!-- Email input field -->
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
            <Label for="password" class="block text-sm font-medium">{{
              $t('login.password')
            }}</Label>
            <div class="relative">

              <!-- Password input -->
              <Input
                :type="isView ? 'text' : 'password'"
                id="password"
                v-model="password"
                class="input-lead w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Password"
              />

              <!-- Toggle icon -->
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

            <!-- Forgot password dialog -->
            <Dialog>
              <DialogTrigger as-child>
                <Button variant="link">{{ $t('login.forgot-password') }}</Button>
              </DialogTrigger>
              <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{{ $t('login.forgot-password') }}</DialogTitle>
                  <DialogDescription>
                    {{ $t('login.reset-password-description') }}
                  </DialogDescription>
                </DialogHeader>

                <!-- Email input inside dialog -->
                <div class="grid gap-4 py-4">
                  <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="email" class="text-right">
                      {{ $t('login.email') }}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="alice@example.com"
                      class="col-span-3"
                      v-model="resetEmail"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose>
                    <Button type="submit" @click="handleResetPassword">
                      {{ $t('login.reset-password') }}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <!-- 2FA dialog for code input -->
            <Dialog v-model:open="isTwoFactorAuthDialogOpen">
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {{ $t('login.2fa-login-title') }}
                  </DialogTitle>
                  <DialogDescription>
                    {{ $t('login.2fa-login-description') }}
                  </DialogDescription>
                </DialogHeader>

                <!-- PIN input component -->
                <PinInput
                  id="pin-input"
                  v-model="pinValue"
                  placeholder="○"
                  class="flex justify-center items-center gap-2"
                  @complete="handleComplete"
                >
                  <PinInputGroup>
                    <PinInputInput v-for="(id, index) in 6" :key="id" :index="index" />
                  </PinInputGroup>
                </PinInput>
                <DialogFooter> </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <!-- Submit button -->
          <Button type="submit" class="w-full bg-primary hover:bg-primary/90">
            {{ $t('login.login') }}
          </Button>
          <p v-if="errorMessage" class="error text-red text-center mt-[10px]">{{ errorMessage }}</p>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
