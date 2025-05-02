<template>
	<div class="flex flex-col min-h-screen">
	  <!-- Breadcrumb -->
	  <div class="p-5">
		<Breadcrumb>
		  <BreadcrumbList>
			<BreadcrumbItem>
			  <BreadcrumbLink href="/admin-panel">
				{{ $t('navigation.admin-panel') }}
			  </BreadcrumbLink>
			</BreadcrumbItem>
		  </BreadcrumbList>
		</Breadcrumb>
	  </div>

	  <!-- Main Content -->
	  <div class="flex-grow p-5">
		<div class="page flex flex-col lg:flex-row gap-8">
		  <!-- Menu Buttons for Admin Actions -->
		  <div class="menu flex flex-col gap-4 w-full lg:w-1/3">
			<h1 class="text-2xl font-bold text-primary">
			  <span v-if="userStore.isSuperAdminUser">
				{{ $t('admin.super-admin') }}: {{ $t('admin.administrate') }}
			  </span>
			  <span v-else>
				{{ $t('admin.administrate') }}
			  </span>
			</h1>

			<Button
			  v-if="userStore.isSuperAdminUser"
			  @click="router.push('/handle-admins')"
			  class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
			>
			  {{ $t('admin.edit-admin') }}
			  <font-awesome-icon icon="fa-solid fa-arrow-right" />
			</Button>
			<Button
			  @click="router.push('/add-new-event')"
			  class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
			>
			  {{ $t('admin.make-new-event') }}
			  <font-awesome-icon icon="fa-solid fa-arrow-right" />
			</Button>
			<Button
			  @click="router.push('/add-new-POI')"
			  class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
			>
			  {{ $t('admin.make-new-POI') }}
			  <font-awesome-icon icon="fa-solid fa-arrow-right" />
			</Button>
			<Button
			  @click="router.push('/add-new-scenario-theme')"
			  class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
			>
			  {{ $t('admin.make-new-scenario-theme') }}
			  <font-awesome-icon icon="fa-solid fa-arrow-right" />
			</Button>
			<Button
			  @click="router.push('/add-new-activity')"
			  class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
			>
			  {{ $t('admin.make-new-activity') }}
			  <font-awesome-icon icon="fa-solid fa-arrow-right" />
			</Button>
			<Button
			  @click="router.push('/edit-event')"
			  class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
			>
			  {{ $t('admin.edit-event') }}
			  <font-awesome-icon icon="fa-solid fa-arrow-right" />
			</Button>
			<Button @click="router.push('/edit-poi')"
			class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
			>
            {{ $t('admin.edit-POI') }}
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
	</div>
  </template>

  <script setup lang="ts">
  import router from '@/router'
  import { useUserStore } from '@/stores/UserStore'
  import { Button } from '@/components/ui/button'
  import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
  } from '@/components/ui/breadcrumb'
  import MapOverviewComponent from '@/components/map/MapOverviewComponent.vue'

  const userStore = useUserStore()
  </script>

  <style scoped>
  /* No additional styles needed as Tailwind CSS handles the layout and responsiveness */
  </style>
