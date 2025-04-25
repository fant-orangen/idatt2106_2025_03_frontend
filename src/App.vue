<script setup lang="ts">
import HeaderNavbar from './components/HeaderNavbar.vue'
import Footer from './components/Footer.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <HeaderNavbar />
    <div class="flex-grow">
      <RouterView />
    </div>
    <Footer />
  </div>
</template>
