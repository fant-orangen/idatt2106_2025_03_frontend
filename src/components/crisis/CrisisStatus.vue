<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { CrisisEventChange} from '@/models/CrisisEventDto.ts'
const props = defineProps<{
  crisisId?: number;
}>();

const { t } = useI18n();
const changes = ref<CrisisEventChange[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Format date for display
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

// Get change type badge class
const getChangeTypeClass = (changeType: string): string => {
  switch (changeType) {
    case 'creation': return 'bg-green-500 text-white';
    case 'level_change': return 'bg-yellow-500 text-black';
    case 'description_update': return 'bg-blue-500 text-white';
    case 'epicenter_moved': return 'bg-purple-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

// Get human-readable change type
const getChangeTypeName = (changeType: string): string => {
  return t(`crisis.change_types.${changeType}`, {
    'creation': 'Created',
    'level_change': 'Severity Changed',
    'description_update': 'Description Updated',
    'epicenter_moved': 'Location Changed'
  }[changeType] || changeType);
};

// Format change description based on type
const getChangeDescription = (change: CrisisEventChange): string => {
  switch (change.change_type) {
    case 'creation':
      return t('crisis.changes.created', 'Event was created');
    case 'level_change':
      return t('crisis.changes.level_changed', 'Severity changed from {old} to {new}', {
        old: change.old_value || '?',
        new: change.new_value || '?'
      });
    case 'description_update':
      return t('crisis.changes.description_updated', 'Description updated');
    case 'epicenter_moved':
      return t('crisis.changes.location_changed', 'Location coordinates updated');
    default:
      return t('crisis.changes.unknown', 'Unknown change');
  }
};

// Fetch changes for the crisis
const fetchChanges = async (crisisId: number) => {
  if (!crisisId) return;

  loading.value = true;
  error.value = null;

  try {
    // Replace with your actual API call
    // const response = await fetch(`/api/crisis-events/${crisisId}/changes`);
    // const data = await response.json();
    // changes.value = data;

    // Mock data for development
    changes.value = [
      {
        id: 1,
        crisis_event_id: crisisId,
        change_type: 'creation',
        old_value: null,
        new_value: 'Flood Warning',
        created_by_user_id: 1,
        created_at: '2023-10-15T14:30:00',
        updated_at: '2023-10-15T14:30:00',
        user_name: 'John Admin'
      },
      {
        id: 2,
        crisis_event_id: crisisId,
        change_type: 'description_update',
        old_value: 'Initial flooding reported',
        new_value: 'Flooding expected in downtown area',
        created_by_user_id: 1,
        created_at: '2023-10-15T15:45:00',
        updated_at: '2023-10-15T15:45:00',
        user_name: 'John Admin'
      },
      {
        id: 3,
        crisis_event_id: crisisId,
        change_type: 'level_change',
        old_value: 'green',
        new_value: 'yellow',
        created_by_user_id: 2,
        created_at: '2023-10-15T16:30:00',
        updated_at: '2023-10-15T16:30:00',
        user_name: 'Sarah Operator'
      },
      {
        id: 4,
        crisis_event_id: crisisId,
        change_type: 'epicenter_moved',
        old_value: '60.3900,5.3200',
        new_value: '60.3913,5.3221',
        created_by_user_id: 2,
        created_at: '2023-10-16T09:15:00',
        updated_at: '2023-10-16T09:15:00',
        user_name: 'Sarah Operator'
      }
    ];
  } catch (err) {
    console.error('Failed to fetch crisis event changes:', err);
    error.value = t('crisis.error_loading_changes', 'Failed to load event history');
  } finally {
    loading.value = false;
  }
};

// Sort changes by date (newest first)
const sortedChanges = computed(() => {
  return [...changes.value].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
});

// Watch for crisis ID changes
watch(() => props.crisisId, (newId) => {
  if (newId) {
    fetchChanges(newId);
  } else {
    changes.value = [];
  }
}, { immediate: true });

onMounted(() => {
  if (props.crisisId) {
    fetchChanges(props.crisisId);
  }
});
</script>

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

      <div v-else-if="!props.crisisId" class="text-center py-4 text-muted-foreground">
        {{ t('crisis.select_event_for_history', 'Select a crisis event to view its history') }}
      </div>

      <div v-else-if="changes.length === 0" class="text-center py-4 text-muted-foreground">
        {{ t('crisis.no_changes', 'No history found for this event') }}
      </div>

      <ScrollArea v-else className="h-[300px]">
        <div class="relative pl-6 border-l border-muted space-y-4 py-2">
          <div
            v-for="change in sortedChanges"
            :key="change.id"
            class="relative"
          >
            <!-- Timeline dot -->
            <div class="absolute w-3 h-3 rounded-full bg-primary -left-7 top-2"></div>

            <div class="mb-1 flex items-center justify-between">
              <Badge :class="getChangeTypeClass(change.change_type)">
                {{ getChangeTypeName(change.change_type) }}
              </Badge>
              <time class="text-xs text-muted-foreground">
                {{ formatDate(change.created_at) }}
              </time>
            </div>

            <p class="text-sm mb-1">{{ getChangeDescription(change) }}</p>

            <div v-if="change.change_type === 'description_update'" class="mt-2 space-y-2">
              <div v-if="change.old_value" class="text-xs bg-muted p-2 rounded">
                <div class="font-semibold text-muted-foreground">{{ t('crisis.previous', 'Previous') }}:</div>
                <div>{{ change.old_value }}</div>
              </div>
              <div v-if="change.new_value" class="text-xs bg-muted p-2 rounded">
                <div class="font-semibold text-muted-foreground">{{ t('crisis.new', 'New') }}:</div>
                <div>{{ change.new_value }}</div>
              </div>
            </div>

            <div class="text-xs text-muted-foreground mt-1">
              {{ t('crisis.by_user', 'By {user}', { user: change.user_name }) }}
            </div>
          </div>
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
</template>
