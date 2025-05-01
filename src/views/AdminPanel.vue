<template>
  <div style="margin: 20px">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage href="/admin-panel">
            {{ t('navigation.admin-panel') }}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="page">
      <div class="menu-section">
        <h1>{{ t('admin.administrate') }}</h1>
        <div class="menu">
          <Button @click="router.push('/add-new-event')">
            {{ t('admin.make-new-event') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" />
          </Button>
          <Button @click="router.push('/add-new-POI')">
            {{ t('admin.make-new-POI') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" />
          </Button>
          <Button @click="router.push('/add-new-activity')">
            {{ t('admin.make-new-activity') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" />
          </Button>
          <Button @click="router.push('/edit-event')">
            {{ t('admin.edit-event') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" />
          </Button>
          <Button @click="router.push('/edit-poi')">
            {{ t('admin.edit-POI') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" />
          </Button>
        </div>
      </div>

      <div class="map">
        <h1>{{ t('info.current-situation') }}</h1>
        <MapOverviewComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import MapOverviewComponent from '@/components/map/MapOverviewComponent.vue'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbList
} from '@/components/ui/breadcrumb'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore();

</script>

<style scoped>
.page {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  margin: 40px;
  padding: 10px;
  gap: 40px;
}

.menu-section {
  min-width: 300px;
  flex: 1;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.map {
  flex: 2;
  min-width: 350px;
}

h1 {
  font-size: 2em;
  margin-bottom: 20px;
}

Button {
  width: 100%;
  justify-content: space-between;
}
</style>
