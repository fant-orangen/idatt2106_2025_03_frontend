<script setup lang="ts">

/**
 * This file handles the user registration view.
 * It includes a form with client-side validation (using VeeValidate and Zod),
 * Google reCAPTCHA verification, and integration with the user store for account creation.
 * It provides real-time error/success messages and feedback via toast notifications.
 */

import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useUserStore } from '@/stores/UserStore'
import { useI18n } from 'vue-i18n'
import { getPasswordValidationSchema } from '@/utils/passwordValidation'

/**
 * UI Components
 */

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'vue-sonner'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Eye, EyeOff } from 'lucide-vue-next'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { useRouter } from 'vue-router'
import { AxiosError } from 'axios'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const successMessage = ref('')
const errorMessage = ref('')
const isView = ref(false)

/**
 * Schema validation using Zod and i18n
 */

const isLoading = ref(false)

const passwordSchema = getPasswordValidationSchema(t)
const registerSchema = toTypedSchema(
  z
    .object({
      firstName: z.string().min(1, t('errors.required')),
      lastName: z.string().min(1, t('errors.required')),
      email: z.string().email(t('errors.invalid-email')),
      phone: z.string().min(8, t('errors.invalid-phone')),
      password: passwordSchema,
      confirmPassword: z.string(),
      terms: z.boolean().refine((val) => val === true, {
        message: t('errors.terms'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('errors.passwords-do-not-match'),
      path: ['confirmPassword'],
    }),
)

/**
 * Initialize form with default values
 */
const form = useForm({
  validationSchema: registerSchema,
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  },
})

/**
 * Submit handler: validates form, verifies captcha and registers.
 */

const handleRegister = form.handleSubmit(async (values) => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Get reCAPTCHA token

    const token = await new Promise<string>((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute('6Lee4CorAAAAABwb4TokgKDs9GdFCxpaiZTKfkfQ', { action: 'LOGIN' })
          .then((token) => (token ? resolve(token) : reject('Token generation failed')))
          .catch(reject)
      })
    })

    // Call user store to register

    await userStore.registerUser({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phone,
      recaptchaToken: token,
      privacyPolicyAccepted: values.terms,
    })

    toast.success(t('success.registration-successful'))

    // Redirect to login after short delay.

    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  } catch (err) {
    console.error('Registration failed:', err)
    isLoading.value = false
    // Verify the login credentials

    const token2 = await new Promise<string>((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute('6Lee4CorAAAAABwb4TokgKDs9GdFCxpaiZTKfkfQ', { action: 'LOGIN' })
          .then((token) => (token ? resolve(token) : reject('Token generation failed')))
          .catch(reject)
      })
    })

    const response = await userStore.verifyLogin(values.email, values.password, token2)

    console.log('Login response:', response)

    // Handle the response
    if (response.status === 200) {
      await userStore.login(response.status, response.data.token, values.email)
      router.push('/')
    } else if (response.status === 202) {
      // Ensure the 2FA dialog is reopened
      await userStore.send2FACodeToEmail(values.email) // Send the 2FA code
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
    errorMessage.value = t('errors.registration-failed')
  }
})

const buttonText = computed(() => (isLoading.value ? t('login.loading') : t('login.signup')))
const buttonIcon = computed(() =>
  isLoading.value
    ? `<svg class='animate-spin h-5 w-5 mr-3' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><circle class='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4'></circle><path class='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path></svg>`
    : '',
)
</script>

<template>

  <!-- Registration card -->
  <div
    class="register-wrapper flex justify-center items-center mt-[10vh] mb-[10vh] bg-background p-[1rem]"
  >
    <Card class="register-container min-w-5/6 md:min-w-xl">

      <!-- Header with page title -->
      <CardHeader>
        <h1 class="text-xl font-bold text-center">{{ t('login.signup') }}</h1>
      </CardHeader>

      <!-- Registration form -->
      <CardContent>
        <form id="registerForm" @submit.prevent="handleRegister" class="space-y-4">
          <FormField v-slot="{ field, meta, errorMessage }" name="firstName">
            <FormItem>
              <FormLabel>{{ t('login.first-name') }}*</FormLabel>
              <FormControl><Input v-bind="field" /></FormControl>
              <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField v-slot="{ field, meta, errorMessage }" name="lastName">
            <FormItem>
              <FormLabel>{{ t('login.last-name') }}*</FormLabel>
              <FormControl><Input v-bind="field" /></FormControl>
              <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField v-slot="{ field, meta, errorMessage }" name="email">
            <FormItem>
              <FormLabel>{{ t('login.email') }}*</FormLabel>
              <FormControl><Input type="email" v-bind="field" /></FormControl>
              <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField v-slot="{ field, meta, errorMessage }" name="phone">
            <FormItem>
              <FormLabel>{{ t('login.phone') }}*</FormLabel>
              <FormControl><Input v-bind="field" /></FormControl>
              <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField v-slot="{ field, meta, errorMessage }" name="password">
            <FormItem>
              <FormLabel for="password">{{ $t('reset-password.new-password') }}</FormLabel>
              <div class="relative">
                <FormControl>
                  <Input
                    :type="isView ? 'text' : 'password'"
                    id="password"
                    v-bind="field"
                    :placeholder="$t('reset-password.new-password')"
                  />
                </FormControl>
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
              <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <!-- Confirm Password Field -->
          <FormField v-slot="{ field, meta, errorMessage }" name="confirmPassword">
            <FormItem>
              <FormLabel for="confirmPassword">{{
                $t('reset-password.confirm-new-password')
              }}</FormLabel>
              <div class="relative">
                <FormControl>
                  <Input
                    :type="isView ? 'text' : 'password'"
                    id="confirmPassword"
                    v-bind="field"
                    :placeholder="$t('reset-password.confirm-new-password')"
                  />
                </FormControl>
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
              <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField v-slot="{ field, meta, errorMessage }" name="terms">
            <FormItem>
              <FormControl>
                <div class="flex items-center space-x-2">
                  <Checkbox
                    :modelValue="field.value"
                    @update:modelValue="field.onChange"
                    @blur="field.onBlur"
                    id="terms"
                  />
                  <label for="terms" class="text-sm font-medium space-x-2 leading-none">
                    {{ t('login.consent-1') }}
                    <a href="/privacy-policy" class="underline">
                      {{ t('login.privacy-policy') }}.</a
                    >
                  </label>
                </div>
                <label>
                  <span class="text-sm">
                    {{ t('login.already-user') }}:
                    <a href="/login" class="text-primary underline hover:text-primary/90">
                      {{ t('login.log-in-here', 'Log in here') }}
                    </a>
                  </span>
                </label>
              </FormControl>
              <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <p v-if="successMessage" class="text-crisis-level-green mt-2">{{ successMessage }}</p>
          <p v-if="errorMessage" class="text-crisis-level-red mt-2">{{ errorMessage }}</p>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="registerForm" class="w-full" :disabled="isLoading">
          <span v-html="buttonIcon"></span>
          {{ buttonText }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
