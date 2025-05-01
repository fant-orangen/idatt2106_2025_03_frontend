<template>
<div style="margin:20px">
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

	<div class="page">
		
		<!--Menu buttons for admin actions-->
		<div class="menu">
			<div>
				<h1 v-if="userStore.isSuperAdminUser">{{ $t('admin.super-admin') }}: {{ $t('admin.administrate') }}</h1>
				<h1 v-else>{{ $t('admin.administrate') }}</h1>
			</div>

			<Button v-if="userStore.isSuperAdminUser" @click="router.push('/handle-admins')">
				{{ $t('admin.edit-admin') }}
				<font-awesome-icon icon="fa-solid fa-arrow-right" />
			</Button>
			<Button @click="router.push('/add-new-event')">
				{{ $t('admin.make-new-event') }}
				<font-awesome-icon icon="fa-solid fa-arrow-right" />
			</Button>
			<Button @click="router.push('/add-new-POI')">
				{{ $t('admin.make-new-POI') }}
				<font-awesome-icon icon="fa-solid fa-arrow-right" />
			</Button>
			<Button @click="router.push('/add-new-activity')">
				{{ $t('admin.make-new-activity') }}
				<font-awesome-icon icon="fa-solid fa-arrow-right" />
			</Button>
			<Button @click="router.push('/edit-event')">
				{{ $t('admin.edit-event') }}
				<font-awesome-icon icon="fa-solid fa-arrow-right" />
			</Button>
		</div>
		
    	<div class="map flex-grow">
			<h1>{{ $t('info.current-situation') }}</h1>
      		<MapOverviewComponent />
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
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import MapOverviewComponent from '@/components/map/MapOverviewComponent.vue'

const userStore = useUserStore();

</script>


<style scoped>
.page {
	display: flex;
	flex-flow: row wrap;
	justify-content: space-evenly;
	margin: 40px;
	padding: 10px;
	gap: 20px;
}

.menu {
	padding: 10px;
	display:flex;
	flex-flow: column wrap;
	gap: 70px;
	min-width: 300px;
	
}

h1 {
	font-size: 2em;
}

Button {
	width: fit-content;
	min-height: 50px;
	min-width: 100%;
	font-size: 1em;
}
Button:hover {
  cursor: pointer;
}

</style>
