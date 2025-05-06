<template>
  <div class="profile-info-container">
    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-col items-center mb-6">
          <!-- Profile Avatar -->
          <div class="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <UserIcon class="w-12 h-12 text-primary" />
          </div>

          <!-- Full Name -->
          <h2 class="text-2xl font-bold">{{ profile.firstName }} {{ profile.lastName }}</h2>

          <!-- Email -->
          <p class="text-sm text-muted-foreground mt-1">{{ profile.email }}</p>

          <!-- Verification Badge -->
          <div v-if="profile.emailVerified" class="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 class="w-3 h-3 mr-1" />
            <span>{{ t('settings.account.email.verified', 'Verified') }}</span>
          </div>
        </div>

        <!-- Household info (if available) -->
        <div v-if="profile.householdId" class="flex items-center justify-center p-3 bg-muted rounded-md mb-4">
          <HomeIcon class="w-4 h-4 mr-2 text-muted-foreground" />
          <span class="text-sm">{{ profile.householdName }}</span>
        </div>

        <!-- Additional Info (can be expanded later) -->
        <div class="grid grid-cols-1 gap-2 text-sm">
          <!-- Placeholder for additional profile information -->
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
/**
 * @component UserProfileInfo
 * @description Displays a compact, visually appealing read-only view of a user's profile.
 * Shows essential information like name, email, verification status, and household.
 * Designed to be used for both the current user and other users' profiles.
 */
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from 'vue-i18n'
import type { ExtendedUserProfile } from '@/models/User'
import { UserIcon, HomeIcon, CheckCircle2 } from 'lucide-vue-next'

const { t } = useI18n()

// Props
defineProps<{
  profile: ExtendedUserProfile
}>()
</script>
