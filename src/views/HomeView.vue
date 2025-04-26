<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'
import MapOverviewComponent from '@/components/map/MapOverviewComponent.vue'

const router = useRouter()
const { t } = useI18n()
const currentStatus = 'crisis.no-crisis'
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
      <div class="before-during-after flex flex-col gap-20">
        <Button class="h-30 w-80" @click="router.push('before-crisis')">
          {{ t('time.before') }}
        </Button>
        <Button class="h-30 w-80" @click="router.push('during-crisis')">
          {{ t('time.during') }}
        </Button>
        <Button class="h-30 w-80" @click="router.push('after-crisis')">
          {{ t('time.after') }}
        </Button>
      </div>
      <div class="map flex-grow">
        <MapOverviewComponent />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styles if needed */
.container {
  width: 100%;
}
.map {
  /* Ensure map area expands */
  min-height: 300px;
}
</style>
