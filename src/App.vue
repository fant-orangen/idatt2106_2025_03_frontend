<script setup lang="ts">
import HeaderNavbar from './components/HeaderNavbar.vue'
import Footer from './components/Footer.vue'
import { Toaster } from './components/ui/sonner'
import InvitationPopup from './components/invitation/InvitationPopup.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <HeaderNavbar />
    <Toaster class="" />
    <div class="flex-grow">
      <RouterView />
    </div>
    <Footer />
    <InvitationPopup />
  </div>
</template>
