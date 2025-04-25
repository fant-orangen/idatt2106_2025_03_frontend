<template>
  <div class="page">
    <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">
          {{ $t('navigation.home') }}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>{{ $t('navigation.before-crisis-page') }}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>

    <div class="top">
      <h1><b>{{ $t('time.before') }}</b></h1>
      <Button @click="router.push('')">{{ $t('actions.read-more') }}
        <font-awesome-icon icon="fa-solid fa-arrow-right" />
      </Button> <!--mangler path til read more -->
    </div>

    <div style="margin: 10px;">
      <p>Before a crisis occurs you need to make sure you are prepared to take care of yourself... <br> You can find more information about what to store in your emergency storage, and learn more about different crisis' with some of our activities! <br>LALALALALA</p>

    </div>

    <div class="grid">
      <div>
        <h3>{{ $t('storage.storage') }}</h3>
        <Button @click="router.push('/login')">
          {{ $t('info.info-about-storage') }} 
          <font-awesome-icon icon="fa-solid fa-arrow-right"/>
        </Button>
        <Button @click="router.push('/household')">
          {{ $t('storage.your-storage') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button>
      </div>

      <div>
        <h3>{{ $t('navigation.activities') }}</h3>
        <Button @click="router.push('')">
          {{ $t('navigation.activities') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </Button> <!--mangler path-->
      </div>
    </div>

    <div></div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button
import router from '@/router/index.ts'
import { Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator, } from '@/components/ui/breadcrumb' 

</script>

<style scoped>
.page {
  margin: 20px;
}

.top {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  margin: 10px;
}

.grid {
  display: flex;
  flex-flow: row wrap;
  gap: 60px;
  margin: 20px;
}

.grid > div {
  display: flex;
  flex-flow: column wrap;
  padding: 5px;
  margin: 0px;
  gap: 20px;
}
h1 {
  font-size: 3em;

}

h3 {
  font-size: 1.5em;
}

Button {
  width: fit-content;
  border-radius: 7px;
  padding: 20px;
}
Button:hover {
  background-color: var(--color-muted);
  color: var(---muted);
  cursor: pointer;
}

</style>
