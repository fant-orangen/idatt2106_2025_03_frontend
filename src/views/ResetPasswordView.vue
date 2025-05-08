<script setup lang="ts">
import { ref, watch, onMounted, defineProps } from 'vue'
import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import { AxiosError } from 'axios'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { resetPassword } from '@/services/UserService'
import { useRoute } from 'vue-router'

// Import shadcn-vue components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { CardContent, Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-vue-next'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import router from '@/router'
import { getPasswordValidationSchema } from '@/utils/passwordValidation'

const { t } = useI18n()
const route = useRoute()
const tokenFromQuery = ref<string | null>(null)

// Reactive variables
const isView = ref(false)

const passwordValidation = getPasswordValidationSchema(t)

const resetPasswordSchema = toTypedSchema(
  z
    .object({
      password: passwordValidation,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('reset-password.password-req-match'),
      path: ['confirmPassword'],
    }),
)

// Initialize the form with vee-validate
const form = useForm({
  validationSchema: resetPasswordSchema,
  initialValues: {
    password: '',
    confirmPassword: '',
  },
})

// Watch for tokenFromQuery changes and update the form's token value
watch(tokenFromQuery, (newToken) => {
  if (newToken) {
    form.setFieldValue('token', newToken)
  }
})

const props = defineProps<{
  token: string
}>()

// Set tokenFromQuery on component mount
onMounted(() => {
  tokenFromQuery.value = (route.query.token as string) || null
  console.log('Token from query:', tokenFromQuery.value)
})

/**
 * Handles the reset password process.
 */
const handleReset = form.handleSubmit(async (values) => {
  try {
    await resetPassword(props.token, values.password)
    toast.success(t('reset-password.password-updated'))
    router.push('/login')
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status
      if (status === 400) {
        toast.error(t('reset-password.invalid-token'))
      } else if (status === 422) {
        toast.error(t('reset-password.validation-error'))
      } else {
        toast.error(t('errors.unexpected-error'))
      }
    } else {
      toast.error(t('errors.network-error'))
    }
    console.error('Reset password error:', error)
  }
})
</script>

<template>
  <div class="login-wrapper">
    <Card class="min-w-[20vw]">
      <CardHeader>
        <CardTitle class="text-xl font-bold text-center">{{
          $t('reset-password.title')
        }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleReset" class="space-y-4">
          <!-- Password Field -->
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
                  class="absolute right-2 top-1/2 transform -translate-y-1/2"
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
                  class="absolute right-2 top-1/2 transform -translate-y-1/2"
                  @click="isView = !isView"
                >
                  <component :is="isView ? EyeOff : Eye" class="h-5 w-5" />
                </Button>
              </div>
              <FormMessage v-if="meta.touched || meta.validated">{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <!-- Submit Button -->
          <Button type="submit" class="w-full bg-primary hover:bg-primary/90">
            {{ $t('reset-password.title') }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--background-color);
  padding: 1rem;
}
</style>
