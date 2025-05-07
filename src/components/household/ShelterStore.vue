<template>
  <Card class="beredskapslager">
    <CardHeader>
      <CardTitle>{{ $t('household.beredskapslager') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Status messages about food and water -->
      <div class="mb-4">
        <div v-if="!daysOfFood && !daysOfWater" class="text-center text-gray-500">
          {{ $t('household.no-supplies') }}
        </div>
        <div v-else>
          <div
            v-if="daysOfFood !== null"
            class="mb-2 p-2 rounded-md flex items-center"
            :class="getItemClasses(getFoodPriority(daysOfFood))"
          >
            <AlertTriangle class="mr-2 flex-shrink-0" :class="getIconClass(getFoodPriority(daysOfFood))" />
            <p class="text-sm">
              {{ Math.round(daysOfFood) }} dager med mat igjen
            </p>
          </div>
          <div
            v-if="daysOfWater !== null"
            class="mb-2 p-2 rounded-md flex items-center"
            :class="getItemClasses(getWaterPriority(daysOfWater))"
          >
            <AlertTriangle class="mr-2 flex-shrink-0" :class="getIconClass(getWaterPriority(daysOfWater))" />
            <p class="text-sm">
              {{ Math.round(daysOfWater) }} dager med vann igjen
            </p>
          </div>
        </div>
      </div>

      <!-- Button to view beredskapslager -->
      <Button variant="default" class="w-full" @click="router.push('/food-and-drinks')">
        {{ $t('household.your-shelter-store') }}
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
/**
 * @component ShelterStore
 * @description Displays a card with information about the household's emergency supplies (beredskapslager).
 * Shows the number of days remaining for food and water supplies.
 * Provides a button to navigate to the detailed shelter store page.
 */
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { inventoryService } from '@/services/InventoryService';

// Initialize i18n
useI18n();

/**
 * Priority levels for supplies
 * @enum {string}
 */
enum Priority {
  /** Less than 3 days remaining */
  HIGH = 'high',
  /** Less than 7 days remaining */
  MEDIUM = 'medium',
  /** Less than 14 days remaining */
  LOW = 'low',
  /** More than 14 days remaining */
  GOOD = 'good'
}

/** Router instance for navigation */
const router = useRouter();

/** Days of food and water remaining */
const daysOfFood = ref<number | null>(null);
const daysOfWater = ref<number | null>(null);

/**
 * Returns the priority level based on days of food remaining
 * @param {number} days - Number of days of food remaining
 * @returns {Priority} Priority level
 */
const getFoodPriority = (days: number): Priority => {
  if (days < 3) return Priority.HIGH;
  if (days < 7) return Priority.MEDIUM;
  if (days < 14) return Priority.LOW;
  return Priority.GOOD;
};

/**
 * Returns the priority level based on days of water remaining
 * @param {number} days - Number of days of water remaining
 * @returns {Priority} Priority level
 */
const getWaterPriority = (days: number): Priority => {
  if (days < 3) return Priority.HIGH;
  if (days < 7) return Priority.MEDIUM;
  if (days < 14) return Priority.LOW;
  return Priority.GOOD;
};

/**
 * Returns CSS classes for styling items based on their priority level
 * @param {Priority} priority - Priority level of the item
 * @returns {string} CSS classes for styling
 */
const getItemClasses = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH:
      return 'bg-red-50 border border-red-200 dark:text-red-900 dark:bg-red-100';
    case Priority.MEDIUM:
      return 'bg-orange-50 border border-orange-200 dark:text-orange-900 dark:bg-orange-100';
    case Priority.LOW:
      return 'bg-yellow-50 border border-yellow-200 dark:text-yellow-900 dark:bg-yellow-100';
    case Priority.GOOD:
      return 'bg-green-50 border border-green-200';
    default:
      return '';
  }
};

/**
 * Returns CSS classes for styling icons based on priority level
 * @param {Priority} priority - Priority level of the item
 * @returns {string} CSS classes for icon styling
 */
const getIconClass = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH:
      return 'text-red-500';
    case Priority.MEDIUM:
      return 'text-orange-500';
    case Priority.LOW:
      return 'text-yellow-500';
    case Priority.GOOD:
      return 'text-green-500';
    default:
      return '';
  }
};

/**
 * Fetches the days remaining for food and water from the backend
 */
const fetchDaysRemaining = async () => {
  try {
    const [foodDays, waterDays] = await Promise.all([
      inventoryService.getFoodDaysRemaining(),
      inventoryService.getWaterDaysRemaining()
    ]);
    daysOfFood.value = foodDays;
    daysOfWater.value = waterDays;
  } catch (error) {
    console.error('Error fetching days remaining:', error);
  }
};

onMounted(() => {
  fetchDaysRemaining();
});
</script>

<style scoped>
.beredskapslager {
  max-height: 400px;
  overflow-y: auto;
}

.mr-2 {
  width: 18px;
  height: 18px;
}

.mb-2:hover {
  opacity: 0.9;
  cursor: pointer;
}
</style>
