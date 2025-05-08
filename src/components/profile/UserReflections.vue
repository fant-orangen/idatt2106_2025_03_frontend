<template>
  <div class="reflections-container overflow-y-auto max-h-[500px]">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium">{{ t('reflect.your-reflections') }}</h3>
      <Button size="sm" @click="openCreateReflectionDialog">
        <PlusIcon class="w-4 h-4 mr-1" />
        {{ t('reflect.add-reflection') }}
      </Button>
    </div>

    <InfiniteScroll
      :is-loading="isLoading"
      :has-more="hasMore"
      @load-more="loadMoreReflections"
      :loading-text="t('reflect.loading_more', 'Loading more reflections...')"
      :end-message="t('reflect.no_more_reflections', 'No more reflections to load')"
      :threshold="100"
    >
      <div v-if="reflections.length === 0 && !isLoading" class="text-center text-muted-foreground py-4">
        {{ t('reflect.no-reflections', 'No reflections yet') }}
      </div>

      <ul v-else class="timeline">
        <li v-for="reflection in reflections" :key="reflection.id" class="reflection-item">
          <div class="dot"></div>
          <div class="timeline-content">
            <div class="flex justify-between items-baseline">
              <strong class="text-sm text-muted-foreground">{{ formatDate(reflection.createdAt) }}</strong>
              <div class="flex items-center gap-2">
                <Badge
                  v-if="reflection.crisisEventName && reflection.crisisEventId"
                  variant="outline"
                  class="text-xs cursor-pointer hover:bg-accent"
                  @click="navigateToCrisisEvent(reflection.crisisEventId)"
                >
                  {{ reflection.crisisEventName }}
                </Badge>
                <Badge v-if="reflection.shared" variant="secondary" class="text-xs">
                  {{ t('reflect.shared') }}
                </Badge>
              </div>
            </div>
            <div class="flex justify-between items-start mt-1">
              <p class="text-sm mt-1 flex-1">{{ reflection.content }}</p>
              <DropdownMenu v-if="isCurrentUserReflection(reflection)">
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <MoreVertical class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="editReflection(reflection)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    {{ t('common.edit') }}
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="confirmDeleteReflection(reflection)" class="text-destructive focus:text-destructive">
                    <TrashIcon class="mr-2 h-4 w-4" />
                    {{ t('common.delete') }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div class="text-xs text-muted-foreground mt-2">
              {{ reflection.userFirstName }} {{ reflection.userLastName }}
            </div>
          </div>
        </li>
      </ul>
    </InfiniteScroll>

    <!-- Create/Edit Reflection Dialog -->
    <Dialog :open="isDialogOpen" @update:open="isDialogOpen = $event" class="z-[1000]">
      <DialogContent class="sm:max-w-[500px] z-[1000]">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? t('reflect.edit-reflection') : t('reflect.add-reflection') }}</DialogTitle>
          <DialogDescription>
            {{ t('reflect.reflection-description') }}
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <ReflectionForm
            :reflection="currentReflection"
            :is-editing="isEditing"
            @save="saveReflection"
            @cancel="closeDialog"
          />
        </div>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event" class="z-[1000]">
      <AlertDialogContent class="z-[1000]">
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('reflect.delete-reflection') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('reflect.delete-reflection-confirm') }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel class="hover:cursor-pointer">{{ t('common.cancel') }}</AlertDialogCancel>
          <AlertDialogAction @click="deleteReflection" class="bg-destructive hover:bg-destructive/80 hover:cursor-pointer">
            {{ t('common.delete') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
/**
 * @component UserReflections
 * @description Displays a user's reflections after crisis events in a timeline format.
 * Shows reflection entries with dates, titles, and content.
 * Allows users to create, edit, and delete their own reflections.
 * Supports infinite scrolling for loading more reflections.
 */
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';
import { toast } from 'vue-sonner';
import { formatDateFull } from '@/utils/dateUtils';
import type { ReflectionResponseDto, CreateReflectionDto, UpdateReflectionDto } from '@/models/Reflection';
import { getMyReflections, createReflection, updateReflection, deleteReflection as apiDeleteReflection } from '@/services/ReflectionService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusIcon, PencilIcon, TrashIcon, MoreVertical } from 'lucide-vue-next';
import InfiniteScroll from '@/components/ui/InfiniteScroll.vue';
import ReflectionForm from '@/components/profile/ReflectionForm.vue';

const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();

// Reflection data
const reflections = ref<ReflectionResponseDto[]>([]);
const currentPage = ref(0);
const pageSize = 10;
const hasMore = ref(true);
const isLoading = ref(false);

// Dialog state
const isDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const isEditing = ref(false);
const currentReflection = ref<Partial<ReflectionResponseDto> | null>(null);

// Get the current user ID
const currentUserId = computed(() => {
  return userStore.userId ? parseInt(userStore.userId) : null;
});

// Check if a reflection belongs to the current user
const isCurrentUserReflection = (reflection: ReflectionResponseDto): boolean => {
  return reflection.userId === currentUserId.value;
};

// Load reflections from the API
const loadReflections = async (page: number = 0) => {
  if (isLoading.value) return;

  isLoading.value = true;
  try {
    console.log(`Loading user reflections, page=${page}`);
    const response = await getMyReflections(page, pageSize);
    console.log('Received response:', response);

    if (page === 0) {
      reflections.value = response.content;
    } else {
      reflections.value = [...reflections.value, ...response.content];
    }

    hasMore.value = !response.last;
    currentPage.value = page;
    console.log(`Updated hasMore=${hasMore.value}, currentPage=${currentPage.value}`);
  } catch (error) {
    console.error('Error loading reflections:', error);
    toast.error(t('reflect.error-loading'));
    hasMore.value = false;
  } finally {
    isLoading.value = false;
  }
};

// Load more reflections when scrolling
const loadMoreReflections = () => {
  loadReflections(currentPage.value + 1);
};

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

// Open dialog to create a new reflection
const openCreateReflectionDialog = () => {
  isEditing.value = false;
  currentReflection.value = {
    content: '',
    shared: false
  };
  isDialogOpen.value = true;
};

// Open dialog to edit an existing reflection
const editReflection = (reflection: ReflectionResponseDto) => {
  isEditing.value = true;
  currentReflection.value = { ...reflection };
  isDialogOpen.value = true;
};

// Close the dialog
const closeDialog = () => {
  isDialogOpen.value = false;
  currentReflection.value = null;
};

// Save a reflection (create or update)
const saveReflection = async (reflectionData: CreateReflectionDto | UpdateReflectionDto) => {
  try {
    if (isEditing.value && currentReflection.value?.id) {
      // Update existing reflection
      const updated = await updateReflection(
        currentReflection.value.id,
        reflectionData as UpdateReflectionDto
      );

      // Update the reflection in the list
      const index = reflections.value.findIndex(r => r.id === updated.id);
      if (index !== -1) {
        reflections.value[index] = updated;
      }

      toast.success(t('reflect.updated-success'));
    } else {
      // Create new reflection
      const created = await createReflection(reflectionData as CreateReflectionDto);
      reflections.value.unshift(created);
      toast.success(t('reflect.created-success'));
    }

    closeDialog();
  } catch (error) {
    console.error('Error saving reflection:', error);
    toast.error(t('reflect.save-error'));
  }
};

// Open delete confirmation dialog
const confirmDeleteReflection = (reflection: ReflectionResponseDto) => {
  currentReflection.value = reflection;
  isDeleteDialogOpen.value = true;
};

// Delete a reflection
const deleteReflection = async () => {
  if (!currentReflection.value?.id) return;

  try {
    await apiDeleteReflection(currentReflection.value.id);

    // Remove the reflection from the list
    reflections.value = reflections.value.filter(r => r.id !== currentReflection.value?.id);

    toast.success(t('reflect.deleted-success'));
    isDeleteDialogOpen.value = false;
    currentReflection.value = null;
  } catch (error) {
    console.error('Error deleting reflection:', error);
    toast.error(t('reflect.delete-error'));
  }
};

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
