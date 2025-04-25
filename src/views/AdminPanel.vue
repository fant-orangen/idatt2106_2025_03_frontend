<template>
<div style="margin:20px">
	<Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbPage href="/admin-panel">
          {{ $t('navigation.admin-panel') }}
        </BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</div>

    <div class="page">
			
			<div>
				<h1>{{ $t('admin.administrate') }}</h1>
				
				<div class="menu">
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
				</div>
			</div>

			<div>
				<h1>{{ $t('info.current-situation') }}</h1>
				<p> map should be here <br>Se wireframe for siden 'admin panel' <br><br> her har jeg ingen plan om å kunne trykke på kartet, det er på 'Legg til hendelse' osv. <br>her trengs kun en preview av map:)</p>
			</div>
    </div>
</template>

<script setup lang="ts">
import router from '@/router'
import { Button } from '@/components/ui/button'

</script>


<style scoped>

.page {
	display: flex;
	flex-flow: row wrap;
	justify-content: space-between;
	margin: 20px;
	padding: 10px;
}

.menu {
	padding: 10px;
	display:flex;
	flex-flow: column wrap;
	gap: 20px;
}

h1 {
	font-size: 1.5em;
}

Button {
	width: fit-content;
}

</style>