<template>
  <div class="test h-fill flex flex-col bg-background text-foreground">
    <div class="flex-grow flex flex-col justify-center items-center" style="padding-top: 30vh">
      <h1 class="text-6xl font-bold mb-4">404</h1>
      <p class="text-xl mb-6">Oops! The page you are looking for does not exist.</p>
      <RouterLink
        to="/"
        class="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all"
      >
        Go Back Home
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
