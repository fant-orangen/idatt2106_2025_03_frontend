<template>
  <div class="content flex justify-center items-center w-full pt-5 flex-col gap-0 md:pt-20 md:gap-15">
    <div class="crisis-status w-full px-2 md:w-auto">
      <Card class="crisis-status-card w-full bg-secondary md:w-120">
        <CardHeader class="items-center">
          <CardTitle class="flex flex-col items-center justify-center text-center gap-3 text-xl md:text-2xl">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" size="lg" class="md:size-2xl" />
            {{ t('crisis.crisis-status') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="flex justify-center items-center text-sm md:text-base">
          {{ t(currentStatus) }}
        </CardContent>
      </Card>
    </div>
    <div class="container flex flex-col gap-10 w-full max-w-7xl md:flex-row md:gap-40">
      <!-- Dynamic Buttons -->
      <div class="crisis-components flex flex-col px-4 md:gap-20 md:px-0">
        <component :is="crisisComponents[currentStatus]" />
      </div>
      <div class="map flex-grow px-4 md:px-0">
        <MapOverviewComponent />
      </div>
    </div>
  </div>
</template>

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

<style scoped>
.container {
  width: 100%;
}
.map {
  /* Ensure map area expands */
  min-height: 200px;
  @media (min-width: 768px) {
    min-height: 300px;
  }
}
</style>