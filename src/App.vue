<script setup lang="ts">
import HeaderNavbar from './components/HeaderNavbar.vue'
import router from '@/router/index.ts'
import BeforeCrisis from './components/pages/BeforeCrisis.vue'
</script>

<template>
  <HeaderNavbar />

  <router-view>
  </router-view>
</template>

<style scoped></style>
