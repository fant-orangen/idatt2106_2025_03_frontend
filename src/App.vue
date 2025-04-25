<script setup lang="ts">
import HeaderNavbar from './components/HeaderNavbar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <HeaderNavbar />
    <RouterView />
  </div>
</template>

<style scoped></style>
