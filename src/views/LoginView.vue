<script setup lang="ts">
import { ref, h, watch } from 'vue' // Import watch
import { useUserStore } from '@/stores/UserStore'
import { useI18n } from 'vue-i18n'
import { AxiosError, type AxiosResponse } from 'axios' // Import Axios types

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

// Reactive variables for form fields and state
const email = ref('')
const password = ref('')
const isView = ref(false) // For password visibility toggle
const userStore = useUserStore()
const errorMessage = ref('')
const resetEmail = ref('')
const isLoading = ref(false) // Added loading state
const isTwoFactorAuthDialogOpen = ref(false)
const pinValue = ref<string[]>([]) // For 2FA input

/**
 * Handles the initial login form submission.
 */
async function handleLogin() {
  isLoading.value = true; // Start loading
  errorMessage.value = ''; // Clear previous errors
  isTwoFactorAuthDialogOpen.value = false; // Ensure 2FA dialog is closed initially
  pinValue.value = []; // Clear any previous pin

  try {
    // Call the store's verifyLogin action - it now handles _handleSuccessfulAuth internally
    const response: AxiosResponse = await userStore.verifyLogin(email.value, password.value);

    // Check HTTP status code from the API call
    if (response.status === 200) {
      // Status 200 means non-2FA login was successful OR 2FA was successful (but handled by verify2FACodeInput)
      // The store's _handleSuccessfulAuth is now running asynchronously.
      // We DO NOT route here. The watcher below will handle it.
      console.log('Login API successful (Status 200), waiting for store state update...');
      // isLoading will be set to false by the watcher or error handling
    } else if (response.status === 202 && response.data.isUsing2FA) {
      // Status 202 indicates 2FA is required.
      console.log('2FA Required (Status 202)');
      // Send the 2FA code
      try {
        await userStore.send2FACodeToEmail(email.value);
        toast.info('Verification code sent to your email.'); // Inform user
        isTwoFactorAuthDialogOpen.value = true; // Open the 2FA dialog
        isLoading.value = false; // Stop loading indicator, wait for user input
      } catch (sendCodeError) {
        console.error('Failed to send 2FA code:', sendCodeError);
        errorMessage.value = 'Failed to send verification code. Please try logging in again.';
        isLoading.value = false;
      }
    } else {
      // Handle other unexpected success statuses
      errorMessage.value = t('errors.unexpected-error') + ` (Status: ${response.status})`;
      isLoading.value = false;
    }
  } catch (error: unknown) {
    // Handle errors from userStore.verifyLogin
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status;
      if (status === 401 || status === 400) { // 400 might be bad credentials depending on backend
        errorMessage.value = t('errors.wrong-username-or-password'); // Use specific error message
      } else if (status === 403) {
        errorMessage.value = t('errors.account-locked'); // Example: Account locked
      } else {
        errorMessage.value = t('errors.unexpected-error');
      }
    } else {
      errorMessage.value = t('errors.network-error'); // Generic network error
    }
    console.error('Login error in handleLogin:', error);
    isLoading.value = false; // Stop loading on error
  }
  // Note: isLoading might be left true intentionally if waiting for watcher
}

/**
 * Handles the submission of the 2FA code.
 */
async function handleComplete() {
  isLoading.value = true; // Start loading for verification
  errorMessage.value = ''; // Clear previous errors

  try {
    const pinAsString = pinValue.value.join('');
    if (pinAsString.length !== 6) {
      errorMessage.value = 'Please enter a 6-digit code.';
      isLoading.value = false;
      return;
    }

    const pinAsNumber = Number(pinAsString);
    if (isNaN(pinAsNumber)) {
      errorMessage.value = 'Invalid code format.';
      isLoading.value = false;
      return;
    }

    console.log('Verifying 2FA code:', pinAsNumber);
    // Call the store's verify2FACodeInput - it now handles _handleSuccessfulAuth internally
    const response = await userStore.verify2FACodeInput(email.value, pinAsNumber);

    if (response.status === 200) {
      // 2FA verification successful.
      // The store's _handleSuccessfulAuth is running.
      // We DO NOT route here. The watcher below handles it.
      console.log('2FA Verification API successful (Status 200), waiting for store state update...');
      isTwoFactorAuthDialogOpen.value = false; // Close the dialog
      // isLoading will be set to false by the watcher or error handling
    } else {
      // Handle unexpected success statuses from verify2FACodeInput?
      errorMessage.value = t('errors.unexpected-error') + ` (Status: ${response.status})`;
      isLoading.value = false;
    }

  } catch (error) {
    console.error('Error verifying 2FA code in handleComplete:', error);
    // Check if it's a bad code error (often 400 or 401 depending on backend)
    if (error instanceof AxiosError && (error.response?.status === 400 || error.response?.status === 401)) {
      errorMessage.value = t('errors.invalid-2fa-code') || 'Invalid or expired code.';
    } else {
      errorMessage.value = t('errors.login-failed');
    }
    pinValue.value = []; // Clear the pin input on error
    isLoading.value = false; // Stop loading on error
  }
}

// --- Watch for Authentication State Change ---
// This is the key change: We react to the *store's* state becoming true
// *after* all internal async operations (including profile fetch) are done.
watch(
  () => userStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      // Check if we were in the 2FA flow; if so, dialog should now be closed
      if (!isTwoFactorAuthDialogOpen.value) {
        console.log('UserStore isAuthenticated became true, navigating to home...');
        isLoading.value = false; // Ensure loading stops
        router.push('/'); // Navigate to the desired route AFTER state is confirmed
      } else {
        // This case shouldn't happen if handleComplete closes the dialog first,
        // but as a safeguard:
        console.log('UserStore isAuthenticated became true, but 2FA dialog is still marked open? Waiting.');
      }
    } else {
      // If isAuthenticated becomes false (e.g., logout, failed init), ensure loading stops.
      // This might happen if initializeFromStorage fails after mount.
      isLoading.value = false;
    }
  }
  // { immediate: true } // Optional: run once on component mount if needed,
  // but App.vue's init and guard handle initial load/redirects.
);

// Handle Forgot Password (Conceptual - Assumes backend endpoint exists)
async function handleForgotPassword() {
  if (!resetEmail.value) {
    toast.error('Please enter your email address.');
    return;
  }
  try {
    // TODO: Implement actual API call for forgot password
    // await api.post('/auth/forgot-password', { email: resetEmail.value });
    toast.success('Password Reset Request Received', {
      description: 'If an account exists for ' + resetEmail.value + ', you will receive an email with instructions.',
    });
    // Close dialog programmatically if needed, DialogClose might handle it
  } catch (error) {
    console.error("Forgot password error:", error);
    // Show a generic success message even on error for security
    toast.success('Password Reset Request Received', {
      description: 'If an account exists for ' + resetEmail.value + ', you will receive an email with instructions.',
    });
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
              :disabled="isLoading || isTwoFactorAuthDialogOpen"
            />
          </div>
          <div class="form-group">
            <Label for="password" class="block text-sm font-medium">{{
                $t('login.password')
              }}</Label>
            <div class="relative">
              <Input
                :type="isView ? 'text' : 'password'"
                id="password"
                v-model="password"
                class="input-lead w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Password"
                required
                :disabled="isLoading || isTwoFactorAuthDialogOpen"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-transparent dark:hover:bg-transparent"
                @click="isView = !isView"
                :disabled="isLoading || isTwoFactorAuthDialogOpen"
              >
                <component :is="isView ? EyeOff : Eye" class="h-5 w-5" />
              </Button>
            </div>
            <Dialog>
              <DialogTrigger as-child>
                <Button variant="link" :disabled="isLoading || isTwoFactorAuthDialogOpen">{{ $t('login.forgot-password') }}</Button>
              </DialogTrigger>
              <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{{ $t('login.forgot-password') }}</DialogTitle>
                  <DialogDescription>
                    {{ $t('login.reset-password-description') }}
                  </DialogDescription>
                </DialogHeader>
                <form @submit.prevent="handleForgotPassword">
                  <div class="grid gap-4 py-4">
                    <div class="grid grid-cols-4 items-center gap-4">
                      <Label for="reset-email" class="text-right">
                        {{ $t('login.email') }}
                      </Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="alice@example.com"
                        class="col-span-3"
                        v-model="resetEmail"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose as-child>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">
                      {{ $t('login.reset-password') }}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Button type="submit" class="w-full bg-primary hover:bg-primary/90" :disabled="isLoading || isTwoFactorAuthDialogOpen">
            {{ isLoading && !isTwoFactorAuthDialogOpen ? 'Logging in...' : $t('login.login') }}
          </Button>
          <p v-if="errorMessage && !isTwoFactorAuthDialogOpen" class="error text-red-500 text-center text-sm mt-2">{{ errorMessage }}</p>
        </form>

        <Dialog v-model:open="isTwoFactorAuthDialogOpen">
          <DialogContent @escapeKeyDown.prevent @pointerDownOutside.prevent> {/* Prevent closing */}
            <DialogHeader>
              <DialogTitle>
                {{ $t('login.2fa-login-title') }}
              </DialogTitle>
              <DialogDescription>
                {{ $t('login.2fa-login-description') }}
              </DialogDescription>
            </DialogHeader>
            <form @submit.prevent="handleComplete">
              <PinInput
                id="pin-input"
                v-model="pinValue"
                placeholder="○"
                type="number"
                :length="6"
                class="flex justify-center items-center gap-2 my-4"
                @complete="handleComplete"
              >
                <PinInputGroup>
                  <PinInputInput v-for="(id, index) in 6" :key="id" :index="index" :disabled="isLoading"/>
                </PinInputGroup>
              </PinInput>
              <p v-if="errorMessage && isTwoFactorAuthDialogOpen" class="error text-red-500 text-center text-sm mb-4">{{ errorMessage }}</p>
              <DialogFooter>
                <Button type="button" variant="outline" @click="isTwoFactorAuthDialogOpen = false; isLoading = false; errorMessage = null;" :disabled="isLoading">
                  Cancel
                </Button>
                <Button type="submit" :disabled="isLoading || pinValue.join('').length !== 6">
                  {{ isLoading ? 'Verifying...' : 'Verify Code' }}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
/* Wrapper styling to center the login form */
.login-wrapper {
  display: flex;
  justify-content: center; /* Use center for horizontal centering */
  align-items: center;
  min-height: calc(100vh - 128px); /* Adjust based on header/footer height */
  /* background-color: var(--background-color); // Use Tailwind bg-background */
  padding: 1rem;
}

/* Styling for error messages */
.error {
  /* Use Tailwind class text-red-500 */
}
</style>
