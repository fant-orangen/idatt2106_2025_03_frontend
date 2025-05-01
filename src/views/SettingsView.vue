<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Lock, Unlock, User, Eye, EyeOff } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { updateUserPreference, getUserPreferences } from '@/services/UserService'
import type { UserPreferencesDto } from '@/models/User'
import { useUserStore } from '@/stores/UserStore'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const userStore = useUserStore()
const router = useRouter()

const twoFactorAuthenticationEnabled = ref(false)
const locationSharingEnabled = ref(false)

const newEmail = ref('')
const changeEmailPassword = ref('')

const currentPassword = ref('')
const newPassword = ref('')

const isViewChangePasswordEmail = ref(false)
const isViewCurrentPassword = ref(false)
const isViewNewPassword = ref(false)

function handlePreferenceUpdate(preference: keyof UserPreferencesDto, value: boolean) {
  // Optimistically update the state
  if (preference === 'twoFactorAuthenticationEnabled') {
    twoFactorAuthenticationEnabled.value = value
  }

  updateUserPreference(Number(userStore.userId), preference, value)
    .then(() => {
      console.log('Preference updated successfully')
    })
    .catch((error) => {
      console.error('Error updating preference:', error)
      // Revert the state if the request fails
      if (preference === 'twoFactorAuthenticationEnabled') {
        twoFactorAuthenticationEnabled.value = !value
      }
    })
}

function getPreferences() {
  getUserPreferences()
    .then((preferences) => {
      console.log('Fetched preferences:', preferences)

      twoFactorAuthenticationEnabled.value = preferences.twoFactorAuthenticationEnabled
      locationSharingEnabled.value = preferences.locationSharingEnabled
    })
    .catch((error) => {
      console.error('Error fetching preferences:', error)
      console.log(userStore.token)
    })
}

function handleUpdatePassword(oldPasswordInput: string, newPasswordInput: string) {
  userStore
    .updatePassword(oldPasswordInput, newPasswordInput)
    .then(() => {
      toast(t('settings.account.password.success'), {
        type: 'success',
        description: t('settings.account.password.successDescription'),
      })
      // Reset the password fields
      currentPassword.value = ''
      newPassword.value = ''
      userStore.logout()
      router.push('/login')
    })
    .catch((error) => {
      console.error('Error updating password:', error)
      toast(t('settings.account.password.error'), {
        type: 'error',
        description: t('settings.account.password.errorDescription'),
      })
    })
}

function handleUpdateEmail(newEmailInput: string, passwordInput: string) {
  userStore
    .updateEmail(newEmailInput, passwordInput)
    .then(() => {
      toast(t('settings.account.email.success'), {
        type: 'success',
        description: t('settings.account.email.successDescription'),
      })
      // Reset the email fields
      newEmail.value = ''
      changeEmailPassword.value = ''
      userStore.logout()
      router.push('/login')
    })
    .catch((error) => {
      console.error('Error updating email:', error)
      toast(t('settings.account.email.error'), {
        type: 'error',
        description: t('settings.account.email.errorDescription'),
      })
    })
}

function handleCancelEmailChange() {
  newEmail.value = ''
  changeEmailPassword.value = ''
}

function handleCancelPasswordChange() {
  currentPassword.value = ''
  newPassword.value = ''
}

onMounted(() => {
  getPreferences()
})
</script>

<template>
  <h1 class="text-4xl font-bold text-foreground flex justify-center mb-6 mt-10">
    {{ t('settings.title') }}
  </h1>
  <div class="page-content flex flex-col items-center mt-10 mb-20 w-full">
    <!-- Tabs -->
    <Tabs default-value="account" class="w-full max-w-2/3">
      <!-- Tabs List -->
      <TabsList class="grid grid-cols-2 w-1/2 mx-auto mb-4">
        <TabsTrigger value="account">{{ t('settings.tabs.account') }}</TabsTrigger>
        <TabsTrigger value="notifications">{{ t('settings.tabs.notifications') }}</TabsTrigger>
      </TabsList>

      <!-- Tabs Content -->
      <TabsContent value="account">
        <div class="flex flex-col gap-10">
          <Card>
            <CardHeader>
              <CardTitle class="test text-3xl">{{ t('settings.account.title') }}</CardTitle>
              <CardDescription>
                {{ t('settings.account.description') }}
              </CardDescription>
            </CardHeader>
            <!-- Change Email Setting -->
            <CardHeader>
              <CardTitle>{{ t('settings.account.email.subtitle') }}</CardTitle>
              <CardDescription>
                {{ t('settings.account.email.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent class="account-settings space-y-2">
              <div class="space-y-1">
                <Label for="email">{{ t('settings.account.email.email') }}</Label>
                <Input id="email" :placeholder="t('login.email')" v-model="newEmail" />
              </div>
              <div class="space-y-1 relative">
                <Label for="password">{{ t('login.password') }}</Label>
                <div class="relative">
                  <Input
                    :type="isViewChangePasswordEmail ? 'text' : 'password'"
                    id="password"
                    v-model="changeEmailPassword"
                    class="input-lead w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    :placeholder="t('login.password')"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="absolute inset-y-0 right-2 flex items-center justify-center hover:bg-transparent dark:hover:bg-transparent"
                    @click="isViewChangePasswordEmail = !isViewChangePasswordEmail"
                  >
                    <component :is="isViewChangePasswordEmail ? EyeOff : Eye" class="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div class="flex flex-col gap-4 md:flex-row">
                <Button @click="handleUpdateEmail(newEmail, changeEmailPassword)">{{
                  t('settings.account.save-changes')
                }}</Button>
                <Button variant="outline" @click="handleCancelEmailChange">
                  {{ t('settings.cancel') }}
                </Button>
              </div>
            </CardFooter>
            <!-- Change Password Setting -->
            <CardHeader>
              <CardTitle>{{ t('settings.account.password.title') }}</CardTitle>
              <CardDescription>
                {{ t('settings.account.password.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent class="password-settings space-y-2">
              <div class="space-y-1">
                <Label for="current">{{ t('settings.account.password.current') }}</Label>
                <div class="relative">
                  <Input
                    :type="isViewCurrentPassword ? 'text' : 'password'"
                    id="password"
                    v-model="currentPassword"
                    class="input-lead w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    :placeholder="t('login.password')"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="absolute inset-y-0 right-2 flex items-center justify-center hover:bg-transparent dark:hover:bg-transparent"
                    @click="isViewCurrentPassword = !isViewCurrentPassword"
                  >
                    <component :is="isViewCurrentPassword ? EyeOff : Eye" class="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div class="space-y-1">
                <Label for="new">{{ t('settings.account.password.new') }}</Label>
                <div class="relative">
                  <Input
                    :type="isViewNewPassword ? 'text' : 'password'"
                    id="password"
                    v-model="newPassword"
                    class="input-lead w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    :placeholder="t('login.password')"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="absolute inset-y-0 right-2 flex items-center justify-center hover:bg-transparent dark:hover:bg-transparent"
                    @click="isViewNewPassword = !isViewNewPassword"
                  >
                    <component :is="isViewNewPassword ? EyeOff : Eye" class="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div class="flex flex-col gap-4 md:flex-row">
                <Button @click="handleUpdatePassword(currentPassword, newPassword)">{{
                  t('settings.account.save-changes')
                }}</Button>
                <Button variant="outline" @click="handleCancelPasswordChange">
                  {{ t('settings.cancel') }}
                </Button>
              </div>
            </CardFooter>
            <!-- Security Settings -->
            <CardHeader>
              <CardTitle>{{ t('settings.account.security.title') }}</CardTitle>
              <CardDescription>
                {{ t('settings.account.security.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent class="security-settings space-y-2">
              <div class="space-y-1">
                <Button
                  :variant="twoFactorAuthenticationEnabled ? 'destructive' : 'outline'"
                  @click="
                    handlePreferenceUpdate(
                      'twoFactorAuthenticationEnabled',
                      !twoFactorAuthenticationEnabled,
                    )
                  "
                >
                  <component
                    :is="twoFactorAuthenticationEnabled ? Unlock : Lock"
                    class="w-4 h-4 mr-2"
                  />
                  {{
                    twoFactorAuthenticationEnabled
                      ? t('settings.account.security.disableTwoStep')
                      : t('settings.account.security.enableTwoStep')
                  }}
                </Button>
              </div>
            </CardContent>
            <!-- Delete Account -->
            <CardHeader>
              <CardTitle>{{ t('settings.account.delete.title') }}</CardTitle>
              <CardDescription>
                {{ t('settings.account.delete.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent class="security-settings space-y-2">
              <div class="space-y-1">
                <Button variant="destructive">
                  <User class="w-4 h-4 mr-2" /> {{ t('settings.account.delete.button') }}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <div class="flex flex-col gap-10">
          <Card>
            <CardHeader>
              <CardTitle class="test text-3xl">
                {{ t('settings.notifications.title') }}
              </CardTitle>
              <CardDescription class="text-muted-foreground">
                {{ t('settings.notifications.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- Email Notifications -->
              <div class="flex items-center justify-between border-b pb-4">
                <div>
                  <Label for="email-notifications" class="text-lg font-medium">
                    {{ t('settings.notifications.email.title') }}
                  </Label>
                  <p class="text-sm text-muted-foreground">
                    {{ t('settings.notifications.email.description') }}
                  </p>
                  <div class="items-top flex gap-x-2 pt-4">
                    <Checkbox id="terms1" />
                    <div class="grid gap-1.5 leading-none">
                      <label
                        for="terms1"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {{ t('settings.notifications.email.system') }}
                      </label>
                      <p class="text-sm text-muted-foreground">
                        {{ t('settings.notifications.email.systemDescription') }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter class="flex justify-end">
              <Button class="bg-primary text-primary-foreground hover:bg-primary/90">
                {{ t('settings.notifications.save-changes') }}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
