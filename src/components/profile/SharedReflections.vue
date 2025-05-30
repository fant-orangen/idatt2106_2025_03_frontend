<template>
  <div class="shared-reflections-container overflow-y-auto max-h-[500px]">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium">{{ title }}</h3>
      <div class="flex gap-2">
        <Select v-model="selectedScope" class="w-40">
          <SelectTrigger>
            <SelectValue :placeholder="t('reflect.select-scope')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-if="hasHousehold" value="household">{{ t('reflect.household-only') }}</SelectItem>
            <SelectItem value="group">{{ t('reflect.group-only') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- No household message -->
    <div v-if="!hasHousehold" class="bg-muted p-3 rounded-md mb-4 text-sm">
      <p>{{ t('reflect.no-household-message', 'You are not currently in a household. You can still view shared reflections from the community.') }}</p>
    </div>

    <!-- Cannot view shared reflections message -->
    <div v-if="!hasHousehold && reflections.length === 0 && !isLoading" class="bg-accent p-4 rounded-md mb-4 text-sm border border-accent-foreground/10">
      <p class="font-medium">{{ t('reflect.cannot-view-shared-reflections', 'You need to be in a household to view shared reflections from other users.') }}</p>
      <p class="mt-2">{{ t('reflect.join-household-prompt', 'Join or create a household to connect with others and share reflections.') }}</p>
    </div>

    <InfiniteScroll
      :is-loading="isLoading"
      :has-more="hasMore"
      @load-more="loadMoreReflections"
      :loading-text="t('reflect.loading_more', 'Loading more reflections...')"
      :end-message="t('reflect.no_more_reflections', 'No more reflections to load')"
      :threshold="100"
    >
      <div v-if="reflections.length === 0 && !isLoading && hasHousehold" class="text-center text-muted-foreground py-4">
        {{ t('reflect.no-shared-reflections') }}
      </div>

      <ul v-else class="timeline">
        <li v-for="reflection in reflections" :key="reflection.id" class="reflection-item">
          <div class="dot"></div>
          <div class="timeline-content">
            <div class="flex justify-between items-baseline">
              <strong class="text-sm text-muted-foreground">{{ formatDate(reflection.createdAt) }}</strong>
              <Badge
                v-if="reflection.crisisEventName && reflection.crisisEventId"
                variant="outline"
                class="text-xs cursor-pointer hover:bg-accent"
                @click="navigateToCrisisEvent(reflection.crisisEventId)"
              >
                {{ reflection.crisisEventName }}
              </Badge>
            </div>
            <p class="text-sm mt-1">{{ reflection.content }}</p>
            <div class="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <UserIcon class="h-3 w-3" />
              {{ reflection.userFirstName }} {{ reflection.userLastName }}
            </div>
          </div>
        </li>
      </ul>
    </InfiniteScroll>
  </div>
</template>

<script setup lang="ts">
/**
 * @component SharedReflections
 * @description Displays shared reflections from household members or group members.
 * Allows filtering by scope (all, household, group) and supports infinite scrolling.
 */
import { ref, watch, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { formatDateFull } from '@/utils/dateUtils';
import { UserIcon } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue';
import type { ReflectionResponseDto } from '@/models/Reflection';
import {
  getSharedReflections,
  getHouseholdReflections,
} from '@/services/ReflectionService';

const { t } = useI18n();
const router = useRouter();

// Props
const props = defineProps<{
  title?: string;
  householdId?: number;
  groupId?: number;
  defaultScope?: 'all' | 'household' | 'group';
}>();

// Data
const reflections = ref<ReflectionResponseDto[]>([]);
const currentPage = ref(0);
const pageSize = 5;
const hasMore = ref(true);
const isLoading = ref(false);

// Determine if user has a household
const hasHousehold = computed(() => !!props.householdId);

// Set default scope based on household status
const defaultScope = computed(() => {
  if (props.defaultScope === 'household' && hasHousehold.value) return 'household';
  return 'group';
});

const selectedScope = ref<'household' | 'group'>(hasHousehold.value ? 'household' : 'group');

// Format date for display
const formatDate = (dateString: string): string => {
  return formatDateFull(new Date(dateString));
};

// Navigate to crisis event details
const navigateToCrisisEvent = (crisisEventId: number) => {
  router.push({
    path: '/crisis-event',
    query: { id: crisisEventId.toString() }
  });
};

const loadReflections = async (page: number = 0) => {
  if (isLoading.value) return;

  isLoading.value = true;
  try {
    let response;
    console.log(`Loading reflections with scope=${selectedScope.value}, page=${page}`);

    if (selectedScope.value === 'household' && hasHousehold.value) {
      response = await getHouseholdReflections(page, pageSize);
    } else {
      response = await getSharedReflections(page, pageSize);
    }

    if (page === 0) {
      reflections.value = response.content;
    } else {
      reflections.value = [...reflections.value, ...response.content];
    }

    hasMore.value = !response.last;
    currentPage.value = page;
  } catch (error) {
    console.error(`Error loading ${selectedScope.value} reflections:`, error);
    toast.error(t('reflect.error-loading-shared'));
    hasMore.value = false;
  } finally {
    isLoading.value = false;
  }
};

// Load more reflections when scrolling
const loadMoreReflections = () => {
  loadReflections(currentPage.value + 1);
};

// Watch for changes in selected scope
watch(selectedScope, () => {
  currentPage.value = 0;
  reflections.value = [];
  hasMore.value = true;
  loadReflections(0);
});

// Load initial reflections
onMounted(() => {
  loadReflections();
});
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

.reflection-item {
  transition: background-color 0.2s ease;
  border-radius: 0.5rem;
  padding: 0.5rem;
}

.reflection-item:hover {
  background-color: var(--accent);
}
</style>
