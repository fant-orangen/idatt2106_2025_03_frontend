<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'
import MapOverviewComponent from '@/components/map/MapOverviewComponent.vue'
import CrisisLevelOverview from '@/components/crisis/CrisisLevelOverview.vue'

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

// Handle crisis selection from the CrisisLevelOverview component
const handleCrisisSelect = (crisisId: number) => {
  console.log('Selected crisis:', crisisId)
  router.push({
    path: '/crisis-event',
    query: { id: crisisId.toString() }
  })
}

onMounted(async () => {
  await loadCrisisComponents()
})

</script>

<template>
  <div class="content flex justify-center items-center pt-20 flex-col gap-20">
    <CrisisLevelOverview
      :max-display="3"
      @select-crisis="handleCrisisSelect"
    />
    <div class="container flex flex-row gap-40 w-full max-w-7xl">
      <!-- Dynamic Buttons -->
      <div class="crisis-components flex flex-col gap-20">
        <component :is="crisisComponents[currentStatus]" />

        <!-- Crisis Level Overview Component -->
        <CrisisLevelOverview
          :max-display="4"
          @select-crisis="handleCrisisSelect"
        />
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
