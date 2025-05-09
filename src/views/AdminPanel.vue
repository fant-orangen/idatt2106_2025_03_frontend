<template>
	<div class="flex flex-col min-h-screen">
	  <!-- Breadcrumb -->
	  <div class="p-5">
		<Breadcrumb>
		  <BreadcrumbList>
			<BreadcrumbItem>
				<BreadcrumbLink href="/">
				{{ $t('navigation.home') }}
				</BreadcrumbLink>
			</BreadcrumbItem>
			<BreadcrumbSeparator/>
			<BreadcrumbItem>
			  <BreadcrumbLink href="/admin/admin-panel">
				{{ $t('navigation.admin-panel') }}
			  </BreadcrumbLink>
			</BreadcrumbItem>
		  </BreadcrumbList>
		</Breadcrumb>
	  </div>

	  <!-- Main Content -->
	  <div class="flex-grow p-5">
		<div class="page flex flex-col gap-8">

      <!-- Menu Buttons for Admin Actions -->
		  <div class="menu flex flex-col gap-4 w-full">
			<h1 class="text-2xl font-bold text-primary">
			  <span v-if="userStore.isSuperAdminUser">
				{{ $t('admin.super-admin') }}: {{ $t('admin.administrate') }}
			  </span>
			  <span v-else>
				{{ $t('admin.administrate') }}
			  </span>
			</h1>

<div class="menu grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Handle admins -->
        <Button
          @click="router.push('/admin/add-new-event')"
          class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
        >
          <!-- Add new event -->
          {{ $t('admin.make-new-event') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
        <Button
          @click="router.push('/admin/add-new-POI')"
          class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
        >
          {{ $t('admin.make-new-POI') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
        <Button
          @click="router.push('/admin/add-new-scenario-theme')"
          class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
        >
          <!-- Add new scenario theme -->
          {{ $t('admin.make-new-scenario-theme') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
        <Button
          @click="router.push('/admin/edit-event')"
          class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
        >
          <!-- Edit event -->
          {{ $t('admin.edit-event') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
        <Button @click="router.push('/admin/edit-poi')"
        class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
        >
          <!-- Edit POI -->
          {{ $t('admin.edit-POI') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
        <Button
          @click="router.push('/admin/edit-scenario-theme')"
          class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
        >
          <!-- Edit scenario theme -->
          {{ $t('admin.edit-scenario-theme') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
        <Button @click="router.push('/admin/news')"
        class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm">
          {{ $t('admin.news') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
        <Button
          @click="router.push('/admin/meeting-point')"
          class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
        >
          {{ $t('admin.meeting-point') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
        <Button
          @click="router.push('/quiz-overview/admin/new-quiz')"
          class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
        >
          <!-- Make a new activity -->
          {{ $t('admin.make-new-activity') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
        <Button
          v-if="userStore.isSuperAdminUser"
          @click="router.push('/admin/handle-admins')"
          class="w-full bg-primary hover:bg-primary/90 py-2 px-3 rounded-md flex justify-between items-center text-sm"
        >
          {{ $t('admin.edit-admin') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
        </div>
		  </div>

		  <!-- Map Section -->
		  <div class="map flex-grow pb-20">
			<h1 class="text-2xl font-bold text-primary mb-4">
			  {{ $t('info.current-situation') }}
			</h1>
      <!-- Map Button Section -->
      <section class="w-full px-4">
        <MapViewComponent />
      </section>
		  </div>
		</div>
	  </div>
	</div>
  </template>

  <script setup lang="ts">
  /**
   * @component AdminPanel
   * @description Displays the admin page with options to add and edit events, scenario themes,
   * points of interest and meeting places etc.
   */
  import router from '@/router'
  import { useUserStore } from '@/stores/UserStore'
  import MapViewComponent from '@/components/homeview/MapViewComponent.vue';
  import { Button } from '@/components/ui/button'
  import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
  } from '@/components/ui/breadcrumb'
  const userStore = useUserStore()
  </script>

  <style scoped>
  </style>
