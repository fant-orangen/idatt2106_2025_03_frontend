

<template>
  <Card class="flex flex-col h-full">
    <CardHeader class="pb-2">
      <CardTitle>{{ t('crisis.status_history', 'Event History') }}</CardTitle>
    </CardHeader>
    <CardContent class="flex-grow">
      <div v-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>

      <div v-else-if="!crisisId" class="text-center py-4 text-muted-foreground">
        {{ t('crisis.select_event_for_history', 'Select a crisis event to view its history') }}
      </div>

      <div v-else-if="changes.length === 0 && !loading" class="text-center py-4 text-muted-foreground">
        {{ t('crisis.no_changes', 'No history found for this event') }}
      </div>

      <div v-else-if="initialLoading" class="flex justify-center items-center py-6">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <ScrollArea v-if="crisisId && !error && !initialLoading" class="h-[300px]">
        <InfiniteScroll
          :isLoading="loading"
          :hasMore="hasMore"
          :loadingText="t('crisis.loading_more', 'Loading more history...')"
          :endMessage="t('crisis.no_more_history', 'No more history to load')"
          @load-more="loadMore"
        >
          <div v-if="changes.length > 0" class="relative pl-6 border-l border-muted space-y-4 py-2">
          <div
            v-for="change in sortedChanges"
            :key="change.id"
            class="relative"
          >
            <div class="absolute w-3 h-3 rounded-full bg-primary -left-7 top-2"></div>

            <!-- Render change content -->
            <div class="mb-1 flex items-center justify-between">
              <Badge :class="[getChangeTypeClass(change.changeType), 'pl-[2.5]']">
                {{ getChangeTypeName(change.changeType) }}
              </Badge>
              <time class="text-xs text-muted-foreground">
                {{ formatDateFull(change.createdAt) }}
              </time>
            </div>

            <p class="text-sm mb-1">{{ getChangeDescription(change) }}</p>

            <div v-if="change.changeType === 'description_update'" class="mt-2 space-y-2">
              <div v-if="change.oldValue" class="text-xs bg-muted p-2 rounded">
                <div class="font-semibold text-muted-foreground">{{ t('crisis.previous', 'Previous') }}:</div>
                <div>{{ change.oldValue }}</div>
              </div>
              <div v-if="change.newValue" class="text-xs bg-muted p-2 rounded">
                <div class="font-semibold text-muted-foreground">{{ t('crisis.new', 'New') }}:</div>
                <div>{{ change.newValue }}</div>
              </div>
            </div>

            <div class="text-xs text-muted-foreground mt-1">
              {{ t('crisis.by_user', { user: change.createdByUserId }) }}
            </div>
          </div>
        </div>
        </InfiniteScroll>
      </ScrollArea>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CrisisEventChange } from '@/models/CrisisEvent.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchCrisisEventChanges } from '@/services/CrisisEventService.ts';
import { formatDateFull } from '@/utils/dateUtils.ts';
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue';
import { getSeverityColor } from '@/utils/severityUtils';

/**
 * CrisisEventHistory component
 *
 * This component displays a chronological history of changes made to a crisis event.
 * It shows a timeline of modifications including:
 * - Creation events
 * - Severity level changes
 * - Description updates
 * - Location changes
 *
 * The component supports infinite scrolling to load more history items as needed.
 *
 * @component
 */

/**
 * Component props
 */
const props = defineProps<{
  /** The ID of the crisis event to show history for. Can be null if no crisis is selected. */
  crisisId: number | null;
}>();

const { t } = useI18n();
const error = ref<string | null>(null);
const changes = ref<CrisisEventChange[]>([]);
const page = ref(0);
const size = 3;
const hasMore = ref(true);
const loading = ref(false);
const initialLoading = ref(false);

/**
 * Returns the appropriate CSS class or inline style for a change type badge
 *
 * @param changeType - The type of change
 * @param severity - The severity level (optional, used for 'creation' and 'level_change')
 * @returns CSS class string or inline style for styling the badge
 */
 const getChangeTypeClass = (changeType: string, severity?: string): string => {
  switch (changeType) {
    case 'creation':
      return `bg-[${getSeverityColor(severity || 'default')}]`;
    case 'level_change':
      return `bg-[${getSeverityColor(severity || 'default')}]`;
    case 'description_update':
      return 'bg-accent';
    case 'epicenter_moved':
      return 'bg-accent';
    default:
      return 'bg-blue-500';
  }
};

/**
 * Gets the translated display name for a change type
 *
 * @param changeType - The type of change
 * @returns Localized name for the change type
 */
const getChangeTypeName = (changeType: string): string => {
  return t(`crisis.change_types.${changeType}`, {
    'creation': 'Created',
    'level_change': 'Severity Changed',
    'description_update': 'Description Updated',
    'epicenter_moved': 'Location Changed'
  }[changeType] || changeType);
};

/**
 * Generates a human-readable description of the change
 *
 * @param change - The change event object
 * @returns Localized description of what changed
 */
const getChangeDescription = (change: CrisisEventChange): string => {
  switch (change.changeType) {
    case 'creation':
      return t('crisis.changes.created', 'Event was created');
    case 'level_change':
      return t('crisis.changes.level_changed', {
        old: change.oldValue || '?',
        new: change.newValue || '?'
      });
    case 'description_update':
      return t('crisis.changes.description_updated', 'Description updated');
    case 'epicenter_moved':
      return t('crisis.changes.location_changed', 'Location coordinates updated');
    default:
      return t('crisis.changes.unknown', 'Unknown change');
  }
};

/**
 * Computed property that sorts changes by date (newest first)
 */
const sortedChanges = computed(() => {
  return [...changes.value].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});

/**
 * Function to load more data when scrolling
 * Called by the InfiniteScroll component
 */
const loadMore = () => {
  if (props.crisisId) {
    fetchChanges(props.crisisId);
  }
};

/**
 * Fetches a page of crisis event changes from the API
 * Handles loading states and pagination
 *
 * @param crisisId - The ID of the crisis event to fetch changes for
 */
const fetchChanges = async (crisisId: number) => {
  if (loading.value || !hasMore.value) {
    return;
  }

  // Set appropriate loading state
  if (page.value === 0) {
    initialLoading.value = true;
  }
  loading.value = true;

  try {
    const response = await fetchCrisisEventChanges(crisisId, page.value, size);
    changes.value.push(...response.content);
    page.value++;
    hasMore.value = page.value < response.totalPages;
  } catch (err) {
    console.error('Failed to load more changes:', err);
    error.value = t('crisis.error_loading_changes', 'Failed to load event history');
  } finally {
    loading.value = false;
    initialLoading.value = false;
  }
};

/**
 * Watch for changes to the crisis ID and reload data when it changes
 */
watch(() => props.crisisId, (newId) => {
  // Reset pagination and state when crisis changes
  changes.value = [];
  page.value = 0;
  hasMore.value = true;
  error.value = null;

  if (newId) {
    fetchChanges(newId);
  }
}, { immediate: true });



</script>
