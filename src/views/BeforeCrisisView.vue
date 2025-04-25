<template>
  <div class="page">
    <div class="top">
      <h1>Før</h1>
      <Button variant="primary" @click="router.push('/info')">Les mer</Button>
    </div>
    <div class="grid">
      <div>
        <h3>Beredskapslager</h3>
        <p>tekst tekst</p>
        <Button variant="primary" @click="goToHousehold">go to household -></Button>
      </div>
      <div>
        <h3>Aktiviteter</h3>
        <p>knapp knapp</p>
      </div>
    </div>

    <div></div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'
const router = useRouter()

const goToHousehold = () => {
  router.push('/household')
}

</script>

<style scoped>
.page {
  margin: 10px;
}

.top {
  display: flex;
  flex-flow: row wrap;
  color: var(--text-color);
  justify-content: space-between;
  margin: 20px;
}
.grid {
  display: flex;
  flex-flow: row wrap;
  gap: 20px;
}
.grid > div {
  background-color: var(--background-color);
  padding: 5px;
  margin: 20px;
}
h3 {
  color: var(--primary-color);
}
</style>
