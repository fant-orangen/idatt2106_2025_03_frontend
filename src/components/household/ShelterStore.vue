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
      <Button variant="primary" class="w-full" @click="viewBeredskapslager">
        {{ $t('household.your-shelter-store') }}
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-vue-next';
import { daysLeft } from '@/utils/dateUtils.ts';
import { useRouter } from 'vue-router';

// Initialize i18n
useI18n();


// Priority levels
enum Priority {
  HIGH = 'high',   // Less than 7 days
  MEDIUM = 'medium', // Less than 30 days
  LOW = 'low'      // Less than 90 days
}

// Types
interface ExpiringItem {
  id: number;
  name: string;
  expiryDate: Date;
  daysLeft: number;
  priority: Priority;
}

// Router
const router = useRouter();

// State
const expiringItems = ref<ExpiringItem[]>([]);

// Computed property to sort items by priority (high to low)
const sortedExpiringItems = computed(() => {
  return [...expiringItems.value].sort((a, b) => {
    const priorityOrder = { [Priority.HIGH]: 0, [Priority.MEDIUM]: 1, [Priority.LOW]: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
});

// Helper function to determine priority based on days left
const getPriority = (days: number): Priority => {
  if (days < 7) return Priority.HIGH;
  if (days < 30) return Priority.MEDIUM;
  return Priority.LOW;
};

// Helper function to get CSS classes based on priority
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

// Helper function to get icon color based on priority
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

// Mock data for demonstration (replace with actual API calls)
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
    { id: 1, name: 'Canned beans', expiryDate: threeDaysLater },
    { id: 2, name: 'Water bottles', expiryDate: fifteenDaysLater },
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

// Methods
const viewBeredskapslager = () => {
  // Navigate to the shelter store page
  router.push('/lager');
};
</script>

<style scoped>
.beredskapslager {
  height: 100%;
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
