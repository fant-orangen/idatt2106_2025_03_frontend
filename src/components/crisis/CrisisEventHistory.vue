

<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle>{{ t('crisis.status_history', 'Event History') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="flex justify-center items-center py-6">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>

      <div v-else-if="!crisisId" class="text-center py-4 text-muted-foreground">
        {{ t('crisis.select_event_for_history', 'Select a crisis event to view its history') }}
      </div>

      <div v-else-if="changes.length === 0" class="text-center py-4 text-muted-foreground">
        {{ t('crisis.no_changes', 'No history found for this event') }}
      </div>

      <InfiniteScroll
        v-else
        :isLoading="loading"
        :hasMore="hasMore"
        @load-more="() => crisisId && fetchChanges(crisisId)"
      >
        <ScrollArea class="h-[300px] overflow-y-auto">
          <div class="relative pl-6 border-l border-muted space-y-4 py-2">
            <div
              v-for="change in sortedChanges"
              :key="change.id"
              class="relative"
            >
              <div class="absolute w-3 h-3 rounded-full bg-primary -left-7 top-2"></div>

              <!-- Render change content -->
              <div class="mb-1 flex items-center justify-between">
                <Badge :class="getChangeTypeClass(change.changeType)">
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
                {{ t('crisis.by_user', { user: change.userName }) }}
              </div>
            </div>
          </div>
        </ScrollArea>
      </InfiniteScroll>
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
import { fetchCrisisEventChanges } from '@/services/api/CrisisEventService.ts';
import { formatDateFull } from '@/utils/dateUtils.ts';
import { useInfiniteScroll } from '@/composables/UseInfiniteScroll.ts';
import InfiniteScroll from '@/composables/infiniteScroll.vue';

const props = defineProps<{
  crisisId: number | null;
}>();

const { t } = useI18n();
const error = ref<string | null>(null);
const changes = ref<CrisisEventChange[]>([]);
const page = ref(0);
const size = 3;
const hasMore = ref(true);
const loading = ref(false);

const getChangeTypeClass = (changeType: string): string => {
  switch (changeType) {
    case 'creation': return 'bg-green-500 text-white';
    case 'level_change': return 'bg-yellow-500 text-black';
    case 'description_update': return 'bg-blue-500 text-white';
    case 'epicenter_moved': return 'bg-purple-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getChangeTypeName = (changeType: string): string => {
  return t(`crisis.change_types.${changeType}`, {
    'creation': 'Created',
    'level_change': 'Severity Changed',
    'description_update': 'Description Updated',
    'epicenter_moved': 'Location Changed'
  }[changeType] || changeType);
};

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

const sortedChanges = computed(() => {
  return [...changes.value].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});

const fetchChanges = async (crisisId: number) => {
  console.log('fetchChanges called'); // Debugging
  if (loading.value || !hasMore.value) {
    console.log('Not fetching changes because loading:', loading.value, 'hasMore:', hasMore.value); // Debugging
    return;
  }
  loading.value = true;
  try {
    console.log('Fetching page:', page.value); // Debugging
    const response = await fetchCrisisEventChanges(crisisId, page.value, size);
    console.log('Fetched data:', response); // Debugging
    changes.value.push(...response.content);
    page.value++;
    hasMore.value = page.value < response.totalPages;
    console.log('Updated hasMore:', hasMore.value); // Debugging
  } catch (err) {
    console.error('Failed to load more changes:', err);
  } finally {
    loading.value = false;
    console.log('Loading finished'); // Debugging
  }
};

watch(() => props.crisisId, (newId) => {
  console.log('crisisId changed:', newId);
  // Reset pagination when crisis changes
  changes.value = [];
  page.value = 0;
  hasMore.value = true;

  if (newId) {
    fetchChanges(newId);
  }
}, { immediate: true });

</script>
