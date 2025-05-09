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
import {
  updateUserPreference,
  getUserPreferences,
  getUserProfile,
  updateUserProfile,
} from '@/services/UserService'
import type {
  UserPreferencesDto,
  ExtendedUserProfile,
  UpdateExtendedUserProfile,
} from '@/models/User'
import { useUserStore } from '@/stores/UserStore'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const userStore = useUserStore()
const router = useRouter()

// User preferences
const twoFactorAuthenticationEnabled = ref(false)
const locationSharingEnabled = ref(false)

// Email and password fields
const currentPassword = ref('')
const newPassword = ref('')

// View toggles for password fields
const isViewCurrentPassword = ref(false)
const isViewNewPassword = ref(false)

// Profile data
const profile = ref<ExtendedUserProfile>({
  id: null,
  email: '',
  firstName: '',
  lastName: '',
  homeAddress: '',
  homeLatitude: null,
  homeLongitude: null,
  locationSharingEnabled: true,
  emailVerified: false,
  householdId: null,
  householdName: '',
})

const isProfileLoading = ref(false)

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
      toast.success(t('settings.account.password.success'), {
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
      toast.error(t('settings.account.password.error'), {
        description: t('settings.account.password.errorDescription'),
      })
    })
}

function handleCancelPasswordChange() {
  currentPassword.value = ''
  newPassword.value = ''
}

// Fetch user profile data
const fetchUserProfile = async () => {
  try {
    isProfileLoading.value = true
    const userData = await getUserProfile()
    profile.value = userData
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    toast.error(t('errors.unexpected-error'))
  } finally {
    isProfileLoading.value = false
  }
}

// Save profile changes
const saveProfile = async () => {
  try {
    isProfileLoading.value = true

    // Create the update DTO with only the fields that can be updated
    const updateProfileDto: UpdateExtendedUserProfile = {
      firstName: profile.value.firstName,
      lastName: profile.value.lastName,
      homeAddress: profile.value.homeAddress,
      homeLatitude: profile.value.homeLatitude,
      homeLongitude: profile.value.homeLongitude,
    }

    await updateUserProfile(updateProfileDto)
    toast.success(t('success.profile-updated', 'Profile updated successfully'))

    // Update the user store with new profile data
    if (userStore.profile) {
      userStore.profile.firstName = profile.value.firstName
      userStore.profile.lastName = profile.value.lastName
      userStore.profile.locationSharingEnabled = profile.value.locationSharingEnabled
    }
  } catch (error) {
    console.error('Failed to update profile:', error)
    toast.error(t('errors.unexpected-error'))
  } finally {
    isProfileLoading.value = false
  }
}

onMounted(() => {
  getPreferences()
  fetchUserProfile()
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
      <TabsList class="grid grid-cols-3 w-2/3 mx-auto mb-4">
        <TabsTrigger value="account">{{ t('settings.tabs.account') }}</TabsTrigger>
        <TabsTrigger value="profile">{{ t('navigation.profile') }}</TabsTrigger>
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

      <!-- Profile Tab Content -->
      <TabsContent value="profile">
        <div class="flex flex-col gap-10">
          <Card>
            <CardHeader>
              <CardTitle class="text-3xl">{{ t('navigation.profile') }}</CardTitle>
              <CardDescription>
                {{ t('settings.profile.description', 'Update your personal information.') }}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form @submit.prevent="saveProfile" class="space-y-4">
                <!-- Name fields -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label for="firstName">{{ t('login.first-name') }}</Label>
                    <Input id="firstName" v-model="profile.firstName" />
                  </div>
                  <div class="space-y-2">
                    <Label for="lastName">{{ t('login.last-name') }}</Label>
                    <Input id="lastName" v-model="profile.lastName" />
                  </div>
                </div>

                <!-- Home address -->
                <div class="space-y-2">
                  <Label for="homeAddress">{{ t('add-event-info.titles.address') }}</Label>
                  <Input id="homeAddress" v-model="profile.homeAddress" />
                  <p class="text-xs text-muted-foreground italic">
                    {{
                      t(
                        'settings.profile.address-privacy',
                        'Your address is not visible to other users.',
                      )
                    }}
                  </p>
                </div>

                <!-- Submit button -->
                <div class="pt-4">
                  <Button type="submit" :disabled="isProfileLoading">
                    {{
                      isProfileLoading
                        ? t('common.saving', 'Saving...')
                        : t('settings.account.save-changes')
                    }}
                  </Button>
                </div>
              </form>
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
