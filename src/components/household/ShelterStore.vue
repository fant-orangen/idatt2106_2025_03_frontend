<template>
  <Card class="beredskapslager">
    <CardHeader>
      <CardTitle>{{ $t('household.beredskapslager') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Messages about items about to expire -->
      <div class="mb-4">
        <div v-if="sortedExpiringItems.length === 0" class="text-center text-gray-500">
          {{ $t('household.no-expiring-items') }}
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
              {{ item.name }} - {{ item.daysLeft }} {{ $t('household.days-left') }}
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
 * Shows items that are about to expire with different priority levels based on expiration dates.
 * Provides a button to navigate to the detailed shelter store page.
 */
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-vue-next';
import { daysLeft } from '@/utils/dateUtils.ts';
import { useRouter } from 'vue-router';

// Initialize i18n
useI18n();


/**
 * Priority levels for expiring items
 * @enum {string}
 */
enum Priority {
  /** Items expiring in less than 7 days */
  HIGH = 'high',
  /** Items expiring in less than 30 days */
  MEDIUM = 'medium',
  /** Items expiring in less than 90 days */
  LOW = 'low'
}

/**
 * Interface representing an item that is about to expire
 * @interface
 */
interface ExpiringItem {
  /** Unique identifier for the item */
  id: number;
  /** Name of the item */
  name: string;
  /** Date when the item expires */
  expiryDate: Date;
  /** Number of days until expiration */
  daysLeft: number;
  /** Priority level based on days left */
  priority: Priority;
}

/** Router instance for navigation */
const router = useRouter();

/** List of items that are about to expire */
const expiringItems = ref<ExpiringItem[]>([]);

/**
 * Computed property that sorts expiring items by priority (high to low)
 * @returns {ExpiringItem[]} Sorted array of expiring items
 */
const sortedExpiringItems = computed(() => {
  return [...expiringItems.value].sort((a, b) => {
    const priorityOrder = { [Priority.HIGH]: 0, [Priority.MEDIUM]: 1, [Priority.LOW]: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
});

/**
 * Determines the priority level based on the number of days until expiration
 * @param {number} days - Number of days until expiration
 * @returns {Priority} Priority level (HIGH, MEDIUM, or LOW)
 */
const getPriority = (days: number): Priority => {
  if (days < 7) return Priority.HIGH;
  if (days < 30) return Priority.MEDIUM;
  return Priority.LOW;
};

/**
 * Returns CSS classes for styling items based on their priority level
 * @param {Priority} priority - Priority level of the item
 * @returns {string} CSS classes for styling
 */
const getItemClasses = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH:
      return 'bg-red-50 border border-red-200';
    case Priority.MEDIUM:
      return 'bg-orange-50 border border-orange-200';
    case Priority.LOW:
      return 'bg-yellow-50 border border-yellow-200';
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
    default:
      return '';
  }
};

/**
 * Initializes the component with mock data for demonstration
 * In a real application, this would fetch data from the backend API
 */
onMounted(() => {
  // Create dates for different timeframes

  const today = new Date();
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);

  const fifteenDaysLater = new Date(today);
  fifteenDaysLater.setDate(today.getDate() + 15);

  const sixtyDaysLater = new Date(today);
  sixtyDaysLater.setDate(today.getDate() + 60);

  // Simulate fetching expiring items from backend with different timeframes
  const items = [
    { id: 1, name: 'Food', expiryDate: threeDaysLater },
    { id: 2, name: 'Water', expiryDate: fifteenDaysLater },
    { id: 3, name: 'Medicine', expiryDate: sixtyDaysLater },
  ];

  // Calculate days left and priority for each item
  expiringItems.value = items.map(item => {
    const days = daysLeft(item.expiryDate);
    return {
      ...item,
      daysLeft: days,
      priority: getPriority(days)
    };
  });
});

/**
 * Navigates to the detailed shelter store page
 */
const viewBeredskapslager = () => {
  router.push('/shelter-frontpage');
};
</script>

<style scoped>
.beredskapslager {
  max-height: 400px; /* Limit the maximum height */
  overflow-y: auto; /* Add scrolling if content exceeds max height */
}

/* Make sure the warning icon is properly sized */
.mr-2 {
  width: 18px;
  height: 18px;
}

/* Add some hover effect to the items */
.mb-2:hover {
  opacity: 0.9;
  cursor: pointer;
}
</style>
