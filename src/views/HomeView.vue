<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'
import MapOverviewComponent from '@/components/map/MapOverviewComponent.vue'

const router = useRouter()
const { t } = useI18n()
const currentStatus = ref('crisis.no-crisis')

const fetchCrisisLevel = "not-implemented" // Placeholder for future implementation
// This function will be used to fetch the crisis level from the backend

const crisisComponents = ref<Record<string, any>>({})

// Function to load components dynamically
const loadCrisisComponents = async () => {
  crisisComponents.value = {
    'crisis.no-crisis': (await import('@/components/homeview/NoCrisisButtons.vue')).default,
    'crisis.during': (await import('@/components/homeview/DuringCrisisButtons.vue')).default,
  }
}

onMounted(async () => {
  await loadCrisisComponents()
  // Simulate fetching the current crisis level
  console.log('Crisis Components:', crisisComponents.value)
  currentStatus.value = 'crisis.no-crisis' // Replace with actual API call
})

</script>

<template>
  <div class="content flex justify-center items-center pt-20 flex-col gap-20">
    <div class="crisis-status">
      <Card class="crisis-status-card w-120 bg-secondary">
        <CardHeader class="items-center">
          <CardTitle class="flex flex-col items-center justify-center text-center gap-3 text-2xl">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" size="2xl" />
            {{ t('crisis.crisis-status') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="flex justify-center items-center">
          {{ t(currentStatus) }}
        </CardContent>
      </Card>
    </div>
    <div class="container flex flex-row gap-40 w-full max-w-7xl">
      <!-- Dynamic Buttons -->
      <div class="crisis-components flex flex-col gap-20">
        <component :is="crisisComponents[currentStatus]" />
      </div>
      <div class="map flex-grow">
        <MapOverviewComponent />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
}
.map {
  /* Ensure map area expands */
  min-height: 300px;
}
</style>
