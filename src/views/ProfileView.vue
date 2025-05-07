<script setup lang="ts">
/**
 * @component ProfileView
 * @description User profile view that displays user information and reflections.
 * Provides a simplified view of the user's profile with only relevant information.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { getUserProfile } from '@/services/UserService'
import { toast } from 'vue-sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserIcon, HomeIcon, CheckCircle2 } from 'lucide-vue-next'
import type { UserBasicInfoDto } from '@/models/User'

const { t } = useI18n()

// Profile data using the simplified UserBasicInfoDto structure
const profile = ref<UserBasicInfoDto>({
  firstName: '',
  lastName: '',
  email: '',
  householdName: '',
  emailVerified: false
})

const isLoading = ref(false)

// Fetch user profile data and convert to basic info format
const fetchUserProfile = async () => {
  try {
    isLoading.value = true
    const userData = await getUserProfile()

    // Map the extended profile to the basic info format
    profile.value = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      householdName: userData.householdName,
      emailVerified: userData.emailVerified
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    toast.error(t('errors.unexpected-error'))
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<template>
  <h1 class="text-4xl font-bold text-foreground flex justify-center mb-6 mt-10">
    {{ t('navigation.profile') }}
  </h1>
  <div class="page-content flex flex-col items-center mt-10 mb-20 w-full">
    <!-- Profile content -->
    <div class="w-full max-w-md">
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
          <div v-if="profile.householdName" class="flex items-center justify-center p-3 bg-muted rounded-md mb-4">
            <HomeIcon class="w-4 h-4 mr-2 text-muted-foreground" />
            <span class="text-sm">{{ profile.householdName }}</span>
          </div>

          <div class="mt-6 flex justify-center">
            <RouterLink to="/reflections">
              <Button>
                {{ t('reflect.view-reflections') }}
              </Button>
            </RouterLink>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
