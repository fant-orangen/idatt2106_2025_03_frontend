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
  updateNotificationPreference,
  getNotificationPreferences,
} from '@/services/UserService'
import type {
  UserPreferencesDto,
  ExtendedUserProfile,
  UpdateExtendedUserProfile,
} from '@/models/User'
import { useUserStore } from '@/stores/UserStore'
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { getPasswordValidationSchema } from '@/utils/passwordValidation'

import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'

const { t } = useI18n()
const userStore = useUserStore()
const router = useRouter()

// User preferences
const twoFactorAuthenticationEnabled = ref(false)
const locationSharingEnabled = ref(false)

// View toggles for password fields
const isViewCurrentPassword = ref(false)
const isViewNewPassword = ref(false)
const isViewConfirmNewPassword = ref(false)

const notificationPreferences = ref({
  email: {
    system: false,
    crisisAlert: false,
    expirationReminder: false,
    supplyAlert: false,
    locationRequest: false,
    safetyRequest: false,
  },
})

const tempNotificationPreferences = ref({ ...notificationPreferences.value })

const saveNotificationPreferences = async () => {
  try {
    // Map camelCase keys to snake_case keys
    const keyMapping: Record<string, string> = {
      system: 'system',
      crisisAlert: 'crisis_alert',
      expirationReminder: 'expiration_reminder',
      supplyAlert: 'remaining_supply_alert',
      locationRequest: 'location_request',
      safetyRequest: 'safety_request',
    }

    for (const [key, value] of Object.entries(tempNotificationPreferences.value.email)) {
      const snakeCaseKey = keyMapping[key] // Convert camelCase to snake_case
      if (snakeCaseKey) {
        await handleNotificationPreferenceUpdate(snakeCaseKey, value)
      }
    }

    // Update the notificationPreferences with the saved preferences
    notificationPreferences.value = { ...tempNotificationPreferences.value }
    toast.success(t('settings.notifications.updated'))
  } catch (error) {
    console.error('Error saving notification preferences:', error)
    toast.error(t('errors.unexpected-error'))
  }
}

const handleNotificationPreferenceUpdate = async (preference: string, value: boolean) => {
  try {
    console.log(`Updating notification preference: ${preference} to ${value}`)
    await updateNotificationPreference(preference, value) // Call the backend API
    console.log(`Notification preference '${preference}' updated successfully.`)
  } catch (error) {
    console.error(`Error updating notification preference '${preference}':`, error)
    toast.error(t('errors.unexpected-error', 'Failed to update notification preference.'))
    // Revert the state if the request fails
    tempNotificationPreferences.value.email[
      preference as keyof typeof tempNotificationPreferences.value.email
    ] = !value
  }
}

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

const passwordSchema = getPasswordValidationSchema(t)

const passwordChangeSchema = toTypedSchema(
  z
    .object({
      currentPassword: z.string().min(1, t('errors.required')),
      newPassword: passwordSchema,
      confirmNewPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t('errors.passwords-do-not-match'),
      path: ['confirmNewPassword'],
    }),
)

const form = useForm({
  validationSchema: passwordChangeSchema,
  initialValues: {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  },
})

const { value: currentPassword } = useField('currentPassword')
const { value: newPassword } = useField('newPassword')
const { value: confirmNewPassword } = useField('confirmNewPassword')

/* global grecaptcha */

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

// function handleTwoFactorAuthentication() {
//   twoFactorAuthenticationEnabled.value = !twoFactorAuthenticationEnabled.value
//   handlePreferenceUpdate('twoFactorAuthenticationEnabled', twoFactorAuthenticationEnabled.value)
// }

const handleUpdatePassword = form.handleSubmit(async (values) => {
  try {
    const token = await new Promise<string>((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute('6Lee4CorAAAAABwb4TokgKDs9GdFCxpaiZTKfkfQ', { action: 'LOGIN' })
          .then((token) => (token ? resolve(token) : reject('Token generation failed')))
          .catch(reject)
      })
    })

    if (!userStore.username) {
      toast.error(t('settings.account.password.error'), {
        description: t('settings.account.password.errorDescription'),
      })
      return
    }

    const verifyLoginResponse = await userStore.verifyLogin(
      userStore.username,
      values.currentPassword,
      token,
    )

    if (verifyLoginResponse.status === 401) {
      toast.error(t('settings.account.password.error'), {
        description: t('settings.account.password.errorDescription'),
      })
      return
    }

    console.log('Updating password with values:', values)
    await userStore.updatePassword(
      values.currentPassword,
      values.newPassword,
      values.confirmNewPassword,
    )
    toast.success(t('settings.account.password.success'), {
      description: t('settings.account.password.successDescription'),
    })
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    router.push('/login')
  } catch (error) {
    console.error('Error updating password:', error)
    toast.error(t('settings.account.password.error'), {
      description: t('settings.account.password.errorDescription'),
    })
  }
})

function handleCancelPasswordChange() {
  currentPassword.value = ''
  newPassword.value = ''
  confirmNewPassword.value = ''
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

const fetchNotificationPreferences = async () => {
  try {
    const preferences = await getNotificationPreferences()
    console.log('Fetched notification preferences:', preferences)

    // Map snake_case keys to camelCase keys
    const keyMapping: Record<string, string> = {
      system: 'system',
      crisis_alert: 'crisisAlert',
      expiration_reminder: 'expirationReminder',
      remaining_supply_alert: 'supplyAlert',
      location_request: 'locationRequest',
      safety_request: 'safetyRequest',
    }

    // Map the preferences array into the expected structure
    const mappedPreferences = preferences.reduce(
      (acc, pref) => {
        const camelCaseKey = keyMapping[pref.preferenceType]
        if (camelCaseKey) {
          acc[camelCaseKey as keyof typeof acc] = pref.enabled
        }
        return acc
      },
      {
        system: false,
        crisisAlert: false,
        expirationReminder: false,
        supplyAlert: false,
        locationRequest: false,
        safetyRequest: false,
      },
    )

    console.log('Mapped notification preferences:', mappedPreferences)

    // Update the notificationPreferences and tempNotificationPreferences
    notificationPreferences.value.email = mappedPreferences
    tempNotificationPreferences.value = { ...notificationPreferences.value }
  } catch (error) {
    console.error('Failed to fetch notification preferences:', error)
    //toast.error(t('errors.unexpected-error', 'Failed to fetch notification preferences.'))
  }
}

onMounted(() => {
  getPreferences()
  fetchUserProfile()
  fetchNotificationPreferences()
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
              <!-- Current Password Field -->
              <form
                id="changePasswordForm"
                @submit.prevent="handleUpdatePassword"
                class="space-y-4"
                autocomplete="off"
              >
                <FormField v-slot="{ field, meta, errorMessage }" name="currentPassword">
                  <FormItem>
                    <Label for="current">{{ t('settings.account.password.current') }}</Label>
                    <div class="relative">
                      <FormControl>
                        <Input
                          :type="isViewCurrentPassword ? 'text' : 'password'"
                          id="currentPassword"
                          v-bind="field"
                          :placeholder="t('login.password')"
                        />
                      </FormControl>
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
                    <FormMessage v-if="meta.touched || meta.validated">{{
                      errorMessage
                    }}</FormMessage>
                  </FormItem>
                </FormField>

                <!-- New Password Field -->
                <FormField v-slot="{ field, meta, errorMessage }" name="newPassword">
                  <FormItem>
                    <Label for="new">{{ t('settings.account.password.new') }}</Label>
                    <div class="relative">
                      <FormControl>
                        <Input
                          :type="isViewNewPassword ? 'text' : 'password'"
                          id="newPassword"
                          v-bind="field"
                          :placeholder="t('reset-password.new-password')"
                        />
                      </FormControl>
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
                    <FormMessage v-if="meta.touched || meta.validated">{{
                      errorMessage
                    }}</FormMessage>
                  </FormItem>
                </FormField>

                <!-- Confirm New Password Field -->
                <FormField v-slot="{ field, meta, errorMessage }" name="confirmNewPassword">
                  <FormItem>
                    <Label for="new">{{ t('settings.account.password.confirmNew') }}</Label>
                    <div class="relative">
                      <FormControl>
                        <Input
                          :type="isViewConfirmNewPassword ? 'text' : 'password'"
                          id="newPassword"
                          v-bind="field"
                          :placeholder="t('reset-password.confirmNew-password')"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        class="absolute inset-y-0 right-2 flex items-center justify-center hover:bg-transparent dark:hover:bg-transparent"
                        @click="isViewConfirmNewPassword = !isViewConfirmNewPassword"
                      >
                        <component :is="isViewConfirmNewPassword ? EyeOff : Eye" class="h-5 w-5" />
                      </Button>
                    </div>
                    <FormMessage v-if="meta.touched || meta.validated">{{
                      errorMessage
                    }}</FormMessage>
                  </FormItem>
                </FormField>
              </form>
            </CardContent>
            <CardFooter>
              <div class="flex flex-col gap-4 md:flex-row">
                <Button type="submit" form="changePasswordForm">{{
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
                  <!-- System Notification -->
                  <div class="expiration-reminder items-top flex gap-x-2 pt-4">
                    <Checkbox
                      id="system"
                      :modelView="tempNotificationPreferences.email.system"
                      @update:modelValue="
                        (value: boolean | 'indeterminate') => {
                          if (typeof value === 'boolean') {
                            tempNotificationPreferences.email.system = value
                          }
                        }
                      "
                    />
                    <div class="grid gap-1.5 leading-none">
                      <label
                        for="system"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {{ t('settings.notifications.email.system') }}
                      </label>
                      <p class="text-sm text-muted-foreground">
                        {{ t('settings.notifications.email.systemDescription') }}
                      </p>
                    </div>
                  </div>

                  <!-- Crisis Alert Notification -->
                  <div class="items-top flex gap-x-2 pt-4">
                    <Checkbox
                      id="crisis-alert"
                      v-model="notificationPreferences.email.crisisAlert"
                    />
                    <div class="grid gap-1.5 leading-none">
                      <label
                        for="crisis-alert"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {{ t('settings.notifications.email.crisisAlert') }}
                      </label>
                      <p class="text-sm text-muted-foreground">
                        {{ t('settings.notifications.email.crisisAlertDescription') }}
                      </p>
                    </div>
                  </div>

                  <!-- Expiration Reminder -->
                  <div class="expiration-reminder items-top flex gap-x-2 pt-4">
                    <Checkbox
                      id="expiration-reminder"
                      v-model="tempNotificationPreferences.email.expirationReminder"
                    />
                    <div class="grid gap-1.5 leading-none">
                      <label
                        for="terms1"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {{ t('settings.notifications.email.expirationReminder') }}
                      </label>
                      <p class="text-sm text-muted-foreground">
                        {{ t('settings.notifications.email.expirationReminderDescription') }}
                      </p>
                    </div>
                  </div>
                  <!-- Remaining Supply Alert -->
                  <div class="remaining-supply-alert items-top flex gap-x-2 pt-4">
                    <Checkbox
                      id="supply-alert"
                      v-model="tempNotificationPreferences.email.supplyAlert"
                    />
                    <div class="grid gap-1.5 leading-none">
                      <label
                        for="terms1"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {{ t('settings.notifications.email.supplyAlert') }}
                      </label>
                      <p class="text-sm text-muted-foreground">
                        {{ t('settings.notifications.email.supplyAlertDescription') }}
                      </p>
                    </div>
                  </div>
                  <!-- Location Request -->
                  <div class="location-request items-top flex gap-x-2 pt-4">
                    <Checkbox
                      id="location-request"
                      v-model="tempNotificationPreferences.email.locationRequest"
                    />
                    <div class="grid gap-1.5 leading-none">
                      <label
                        for="terms1"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {{ t('settings.notifications.email.locationRequest') }}
                      </label>
                      <p class="text-sm text-muted-foreground">
                        {{ t('settings.notifications.email.locationRequestDescription') }}
                      </p>
                    </div>
                  </div>
                  <!-- Safety Request -->
                  <div class="expiration-reminder items-top flex gap-x-2 pt-4">
                    <Checkbox
                      id="safety-request"
                      v-model="tempNotificationPreferences.email.safetyRequest"
                    />
                    <div class="grid gap-1.5 leading-none">
                      <label
                        for="terms1"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {{ t('settings.notifications.email.expirationReminder') }}
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
              <Button
                @click="saveNotificationPreferences()"
                class="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {{ t('settings.notifications.save-changes') }}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
