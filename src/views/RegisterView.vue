<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useUserStore } from '@/stores/UserStore'
import { useI18n } from 'vue-i18n'
import { getPasswordValidationSchema } from '@/utils/passwordValidation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'vue-sonner'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Eye, EyeOff } from 'lucide-vue-next'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

const { t } = useI18n()
const userStore = useUserStore()
const successMessage = ref('')
const errorMessage = ref('')
const isView = ref(false)

/* global grecaptcha */

// Schema
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

const handleRegister = form.handleSubmit(async (values) => {
  try {
    errorMessage.value = ''
    successMessage.value = ''

    const token = await new Promise<string>((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute('6Lee4CorAAAAABwb4TokgKDs9GdFCxpaiZTKfkfQ', { action: 'LOGIN' })
          .then((token) => (token ? resolve(token) : reject('Token generation failed')))
          .catch(reject)
      })
    })

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
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  } catch (err) {
    console.error('Registration failed:', err)
    errorMessage.value = t('errors.registration-failed')
  }
})
</script>

<template>
  <div
    class="register-wrapper flex justify-center items-center mt-[10vh] mb-[10vh] bg-background p-[1rem]"
  >
    <Card class="register-container min-w-5/6 md:min-w-xl">
      <CardHeader>
        <h1 class="text-xl font-bold text-center">{{ t('login.signup') }}</h1>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleRegister" class="space-y-4">
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
                      {{ t('login.already-user') }}
                      <a href="/login" class="text-primary underline hover:text-primary/90">
                        {{ t('login.log-in-here', 'Log in here') }}
                      </a>
                    </span>
                  </label>
              </FormControl>
              <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <p v-if="successMessage" class="text-green-500 text-center mt-2">{{ successMessage }}</p>
          <p v-if="errorMessage" class="text-red-500 text-center mt-2">{{ errorMessage }}</p>

          <Button type="submit" class="w-full bg-primary hover:bg-primary/90">
            {{ t('login.signup') }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
