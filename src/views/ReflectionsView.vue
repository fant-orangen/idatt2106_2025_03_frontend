<template>
  <div class="reflections-view">
    <h1 class="text-4xl font-bold text-foreground flex justify-center mb-6 mt-10">
      {{ t('reflect.reflections') }}
    </h1>

    <div class="page-content flex flex-col items-center mt-10 mb-20 w-full">
      <Tabs default-value="my-reflections" class="w-full max-w-4xl">
        <TabsList class="grid grid-cols-2 w-2/3 mx-auto mb-4">
          <TabsTrigger value="my-reflections">{{ t('reflect.your-reflections') }}</TabsTrigger>
          <TabsTrigger value="shared-reflections">{{ t('reflect.shared-reflections') }}</TabsTrigger>
        </TabsList>

        <!-- My Reflections Tab -->
        <TabsContent value="my-reflections" class="transition-all duration-300 ease-in-out">
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

        <!-- Shared Reflections Tab -->
        <TabsContent value="shared-reflections" class="transition-all duration-300 ease-in-out">
          <Card>
            <CardHeader>
              <CardTitle>{{ t('reflect.shared-reflections') }}</CardTitle>
              <CardDescription>{{ t('reflect.shared-reflections-description') }}</CardDescription>
            </CardHeader>
            <CardContent>
              <SharedReflections
                :title="t('reflect.community-reflections')"
                :household-id="profile.householdId || undefined"
                :default-scope="profile.householdId ? 'all' : 'all'"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @component ReflectionsView
 * @description Dedicated view for user reflections.
 * Provides tabs to toggle between personal reflections and shared reflections.
 */
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getUserProfile } from '@/services/UserService'
import { toast } from 'vue-sonner'
import UserReflections from '@/components/profile/UserReflections.vue'
import SharedReflections from '@/components/profile/SharedReflections.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ExtendedUserProfile } from '@/models/User'

const { t } = useI18n()

// Profile data for household ID
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
