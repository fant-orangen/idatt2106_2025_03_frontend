<script setup lang="ts">
/**
 * @component ProfileView
 * @description User profile view that displays user information and reflections.
 * Provides tabs to toggle between profile information and user reflections.
 */
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getUserProfile } from '@/services/UserService'
import { toast } from 'vue-sonner'
import UserReflections from '@/components/profile/UserReflections.vue'
import UserProfileInfo from '@/components/profile/UserProfileInfo.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ExtendedUserProfile } from '@/models/User'

const { t } = useI18n()

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
  householdName: ''
})

const isLoading = ref(false)

// Fetch user profile data
const fetchUserProfile = async () => {
  try {
    isLoading.value = true
    const userData = await getUserProfile()
    profile.value = userData
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
    <!-- Tabs for toggling between profile and reflections -->
    <Tabs default-value="profile" class="w-full max-w-2/3">
      <TabsList class="grid grid-cols-2 w-2/3 mx-auto mb-4">
        <TabsTrigger value="profile">{{ t('navigation.profile') }}</TabsTrigger>
        <TabsTrigger value="reflections">{{ t('reflect.your-reflections') }}</TabsTrigger>
      </TabsList>

      <!-- Profile Content -->
      <TabsContent value="profile" class="transition-all duration-300 ease-in-out">
        <UserProfileInfo :profile="profile" />
      </TabsContent>

      <!-- Reflections Content -->
      <TabsContent value="reflections" class="transition-all duration-300 ease-in-out">
        <Card>
          <CardHeader>
            <CardTitle>{{ t('reflect.reflection') }}</CardTitle>
            <CardDescription>{{ t('reflect.what-2-do-after-crisis') }}</CardDescription>
          </CardHeader>
          <CardContent>
            <UserReflections />
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
  </div>
</template>
