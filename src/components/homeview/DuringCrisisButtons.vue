/*
  WIP - Not implemented yet
  This component is planned for Sprint 2
*/

<template>
    <div class="content flex justify-center items-center pt-20 flex-col gap-10">
      <div class="container flex flex-col gap-6 w-full max-w-7xl">
        <!-- Buttons Section -->
        <div class="no-crisis-buttons flex flex-col gap-4">
          <!-- Household Button -->
          <Button
            class="flex items-center justify-between gap-2 w-72 px-6 py-3 text-left border rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            @click="navigateTo('household')"
          >
            <font-awesome-icon :icon="['fas', 'home']" class="text-xl" />
            <span class="flex-1 text-sm leading-tight break-words whitespace-normal">
              {{ t('household.my-household') }}
            </span>
            <ArrowRight class="text-lg" />
          </Button>
  
          <!-- Info Button -->
          <Button
            class="flex items-center justify-between gap-2 w-72 px-6 py-3 text-left border rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            @click="navigateTo('info')"
          >
            <font-awesome-icon :icon="['fas', 'info-circle']" class="text-xl" />
            <span class="flex-1 text-sm leading-tight break-words whitespace-normal">
              {{ t('info.read-info-preparations') }}
            </span>
            <ArrowRight class="text-lg" />
          </Button>
        </div>
  
        <!-- Notifications Section -->
        <h2 class="flex items-center justify-left gap-2 text-2xl font-bold text-center">
          {{ t('info.notifications') }}
          <ArrowRight class="text-lg" />
        </h2>

        <!-- News Section -->
         <h2 class="flex items-center justify-left gap-2 text-2xl font-bold text-center">
          {{ t('info.news') }}
          <ArrowRight class="text-lg" />
        </h2>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import { ArrowRight, AlertTriangle } from 'lucide-vue-next'
  import { useI18n } from 'vue-i18n'
  import { Button } from '@/components/ui/button'
  
  const router = useRouter()
  const { t } = useI18n()
  
  // Mock data for demonstration
  const isLoggedIn = true // Change to `false` to test the fallback message
  const sortedExpiringItems = [
    { id: 1, name: 'Milk', daysLeft: 2, priority: 'high' },
    { id: 2, name: 'Bread', daysLeft: 5, priority: 'medium' },
  ]
  
  // Mock functions for item classes
  const getItemClasses = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }
  
  const getIconClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-700'
      case 'medium':
        return 'text-yellow-700'
      default:
        return 'text-gray-700'
    }
  }
  
  const navigateTo = (route) => {
    router.push(route)
  }
  </script>