<script setup lang="ts">
import { ref, h } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useI18n } from 'vue-i18n'

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

// Reactive variables for form fields and error messages
const email = ref('')
const password = ref('')
const isView = ref(false)
const userStore = useUserStore()
const errorMessage = ref('')
const resetEmail = ref('')

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
    // alert(t('success.login-successful'))
    router.push('/')
    console.log('User role is: ',userStore.role)
  } catch (error) {
    errorMessage.value = t('errors.login-failed')
    console.error('Login error:', error)
  }
}
</script>

<template>
  <div class="login-wrapper">
    <Card class="min-w-[20vw]">
      <CardHeader>
        <CardTitle class="text-xl font-bold text-center">{{ $t('login.login') }}</CardTitle>
      </CardHeader>
      <CardContent>
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
            <Label for="password" class="block text-sm font-medium">{{
              $t('login.password')
            }}</Label>
            <div class="relative">
              <!-- Password Input -->
              <Input
                :type="isView ? 'text' : 'password'"
                id="password"
                v-model="password"
                class="input-lead w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Password"
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
                    <Button
                      type="submit"
                      @click="
                        () => {
                          toast('Password Reset Request Received', {
                            description:
                              'You will receive an email with a link to reset your password at ' +
                              resetEmail,
                          })
                        }
                      "
                    >
                      {{ $t('login.reset-password') }}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Button type="submit" class="w-full bg-primary hover:bg-primary/90">
            {{ $t('login.login') }}
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
