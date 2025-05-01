<template>
  <div class="p-5">
    <!-- Breadcrumb -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage href="/admin-panel">
            {{ $t('navigation.admin-panel') }}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="page flex flex-col lg:flex-row gap-6 mt-6">
      <!-- Menu Buttons for Admin Actions -->
      <div class="menu flex flex-col gap-4 w-full lg:w-1/3">
        <h1 class="text-xl font-bold text-primary mb-4">
          {{ $t('admin.administrate') }}
        </h1>

        <Button
          @click="router.push('/add-new-event')"
          class="w-full bg-primary text-white hover:bg-primary/90 py-3 px-4 rounded-md flex justify-between items-center"
        >
          {{ $t('admin.make-new-event') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
        <Button
          @click="router.push('/add-new-POI')"
          class="w-full bg-primary text-white hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
        >
          {{ $t('admin.make-new-POI') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
        <Button
          @click="router.push('/add-new-activity')"
          class="w-full bg-primary text-white hover:bg-primary/90 py-3 px-4 rounded-md flex justify-between items-center"
        >
          {{ $t('admin.make-new-activity') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
        <Button
          @click="router.push('/edit-event')"
          class="w-full bg-primary text-white hover:bg-primary/90 py-3 px-4 rounded-md flex justify-between items-center"
        >
          {{ $t('admin.edit-event') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
      </div>

      <!-- Map Section -->
      <div class="map flex-grow">
        <h1 class="text-2xl font-bold text-primary mb-4">
          {{ $t('info.current-situation') }}
        </h1>
        <div class="w-full h-96 bg-gray-100 rounded-md shadow-md">
          <MapOverviewComponent />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import MapOverviewComponent from '@/components/map/MapOverviewComponent.vue'
</script>

<style scoped>
/* No additional styles needed as Tailwind CSS handles the layout and responsiveness */
</style>