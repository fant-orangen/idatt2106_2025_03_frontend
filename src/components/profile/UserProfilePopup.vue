<template>
  <Dialog :open="isOpen" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md p-0 overflow-hidden">
      <!-- Close button in the corner -->
      <button
        @click="close"
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </button>

      <!-- User Profile Info -->
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-col items-center mb-6">
            <!-- Profile Avatar -->
            <div class="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <UserIcon class="w-12 h-12 text-primary" />
            </div>

            <!-- Full Name -->
            <h2 class="text-2xl font-bold">{{ userProfile?.firstName }} {{ userProfile?.lastName }}</h2>

            <!-- Email -->
            <p class="text-sm text-muted-foreground mt-1">{{ userProfile?.email }}</p>
            <div v-if="userProfile?.emailVerified !== undefined && userProfile.emailVerified" class="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 class="w-3 h-3 mr-1" />
              <span>{{ t('settings.account.email.verified', 'Verified') }}</span>
            </div>
          </div>

          <!-- Household info (if available) -->
          <div v-if="userProfile?.householdName" class="flex items-center justify-center p-3 bg-muted rounded-md mb-4">
            <HomeIcon class="w-4 h-4 mr-2 text-muted-foreground" />
            <span class="text-sm">{{ userProfile?.householdName }}</span>
          </div>
        </CardContent>
      </Card>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
/**
 * @component UserProfilePopup
 * @description A clean popup that displays another user's basic information.
 * Shows only the essential user data: first name, last name, email, and household name.
 * Uses the UserBasicInfoDto structure from the backend API.
 * Includes only a simple close button in the corner for dismissing the popup.
 * Can be triggered by clicking on a user in the application.
 */
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { X, UserIcon, HomeIcon, CheckCircle2 } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import type { UserBasicInfoDto } from '@/models/User'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  isOpen: boolean
  userProfile: UserBasicInfoDto | null
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const updateOpen = (value: boolean) => {
  emit('update:isOpen', value)
}

const close = () => {
  emit('update:isOpen', false)
}
</script>
