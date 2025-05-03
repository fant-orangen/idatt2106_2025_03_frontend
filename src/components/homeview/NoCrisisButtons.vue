<template>
    <div class="content flex justify-center items-center pt-20 flex-col gap-10">
      <div class="container flex flex-col gap-6 w-full max-w-7xl">
        <!-- Buttons Section -->
        <div class="no-crisis-buttons flex flex-col gap-4">
          <!-- Household Button -->
          <Button
          class="flex items-center justify-between gap-2 w-full md:w-72 px-4 py-2 md:px-6 md:py-3 text-left border rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          @click="navigateTo('household')"
          >
          <font-awesome-icon :icon="['fas', 'home']" class="text-lg md:text-xl" />
          <span class="flex-1 text-sm md:text-base leading-tight break-words whitespace-normal">
            {{ t('household.my-household') }}
            </span>
            <ArrowRight class="text-base md:text-lg" />
          </Button>
  
          <!-- Info Button -->
          <Button
            class="flex items-center justify-between gap-2 w-full md:w-72 px-4 py-2 md:px-6 md:py-3 text-left border rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            @click="navigateTo('info')"
          >
            <font-awesome-icon :icon="['fas', 'info-circle']" class="text-lg md:text-xl" />
            <span class="flex-1 text-sm leading-tight break-words whitespace-normal">
              {{ t('info.read-info-preparations') }}
            </span>
            <ArrowRight class="text-base md:text-lg" />
          </Button>
        </div>
  
        <!-- Notifications Section -->
        <RouterLink
            to="/notifications"
            class="flex items-center justify-left gap-2 text-2xl font-bold text-center hover:underline"
        >
            {{ t('info.notifications') }}
            <ArrowRight class="text-lg" />
        </RouterLink>
        <!-- Expiring Items Section -->
        <div class="mb-4">
            <div v-if="sortedExpiringItems.length === 0" class="text-center text-gray-500">
              {{ t('household.no-expiring-items') }}
            </div>
            <div v-else>
              <div
                v-for="item in sortedExpiringItems"
                :key="item.id"
                class="mb-2 p-2 rounded-md flex items-center"
                :class="getItemClasses(item.priority)"
              >
                <AlertTriangle class="mr-2 flex-shrink-0" :class="getIconClass(item.priority)" />
                <p class="text-sm">
                  {{ item.name }} - {{ item.daysLeft }} {{ t('household.days-left') }}
                </p>
            </div>
          </div>
        </div>
        <!-- News Section -->
        <RouterLink
            to="/news"
            class="flex items-center justify-left gap-2 text-2xl font-bold text-center hover:underline"
        >
            {{ t('info.news') }}
            <ArrowRight class="text-lg" />
        </RouterLink>
        </div>
    </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-vue-next'
import { daysLeft } from '@/utils/dateUtils'
import { ArrowRight } from 'lucide-vue-next'

// Router and i18n
const router = useRouter()
const { t } = useI18n()

// State for expiring items
const expiringItems = ref([])

// Computed property to sort items by priority
const sortedExpiringItems = computed(() => {
  return [...expiringItems.value].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
})

// Helper functions for priority
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

// Fetch expiring items (mocked for now)
onMounted(() => {
  const today = new Date()
  const threeDaysLater = new Date(today)
  threeDaysLater.setDate(today.getDate() + 3)

  const fifteenDaysLater = new Date(today)
  fifteenDaysLater.setDate(today.getDate() + 15)

  const sixtyDaysLater = new Date(today)
  sixtyDaysLater.setDate(today.getDate() + 60)

  expiringItems.value = [
    { id: 1, name: 'Canned beans', expiryDate: threeDaysLater, daysLeft: daysLeft(threeDaysLater), priority: 'high' },
    { id: 2, name: 'Water bottles', expiryDate: fifteenDaysLater, daysLeft: daysLeft(fifteenDaysLater), priority: 'medium' },
    { id: 3, name: 'Medicine', expiryDate: sixtyDaysLater, daysLeft: daysLeft(sixtyDaysLater), priority: 'low' }
  ]
})

// Navigation function
const navigateTo = (route) => {
  router.push(route)
}
</script>