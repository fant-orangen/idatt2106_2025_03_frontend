<template>
  <div class="reflections-container">
    <ScrollArea className="h-[300px]">
      <!-- This is a placeholder for the actual reflections content -->
      <div v-if="reflections.length === 0" class="text-center text-muted-foreground py-4">
        {{ t('reflect.no-reflections', 'No reflections yet') }}
      </div>

      <ul v-else class="timeline">
        <li v-for="reflection in reflections" :key="reflection.id">
          <div class="dot"></div>
          <div class="timeline-content">
            <div class="flex justify-between items-baseline">
              <strong class="text-sm text-muted-foreground">{{ formatDate(reflection.date) }}</strong>
            </div>
            <h4 class="font-medium mt-1">{{ reflection.title }}</h4>
            <p class="text-sm mt-1">{{ reflection.content }}</p>
          </div>
        </li>
      </ul>
    </ScrollArea>

    <div class="mt-4">
      <p class="text-sm mt-2">{{ t('reflect.need-help-q') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @component UserReflections
 * @description Displays a user's reflections after crisis events in a timeline format.
 * Shows reflection entries with dates, titles, and content.
 * Currently uses mock data, but would be connected to backend API in production.
 */
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ScrollArea } from '@/components/ui/scroll-area';

const { t } = useI18n();

// Mock data for reflections - this would be replaced with actual API calls
const reflections = ref([
  {
    id: 1,
    date: new Date(2023, 5, 15),
    title: 'After the storm',
    content: 'Reflected on how our household managed during the recent storm. We were well prepared with emergency supplies, but our communication plan needs improvement.'
  },
  {
    id: 2,
    date: new Date(2023, 7, 22),
    title: 'Power outage learnings',
    content: 'The three-day power outage taught us we need better alternative lighting solutions and a more reliable way to charge essential devices.'
  },
  {
    id: 3,
    date: new Date(2023, 10, 5),
    title: 'Community response',
    content: 'Our neighborhood response to the flooding was impressive. Neighbors helped each other and shared resources. We should formalize this network for future events.'
  }
]);

// Format date for display
const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};
</script>

<style scoped>
.timeline {
  position: relative;
  padding-left: 1.5rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--border);
}

.timeline li {
  position: relative;
  margin-bottom: 1.5rem;
}

.dot {
  position: absolute;
  left: -1.5rem;
  top: 0.25rem;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: var(--primary);
  transform: translateX(-50%);
}

.timeline-content {
  padding: 0.5rem 0;
}
</style>
