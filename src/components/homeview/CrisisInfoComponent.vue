<template>
  <div class="crisis-info bg-card p-6 rounded-lg border border-[var(--crisis-level-red)]/30">
    <h2 class="text-xl font-bold mb-3 flex items-center">
      <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="mr-2 text-[var(--crisis-level-red)]" />
      {{ t('home.crisis_info.title') }}
    </h2>
    <p class="mb-4 text-muted-foreground">{{ t('home.crisis_info.description') }}</p>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      <div class="text-center p-4 bg-[var(--crisis-level-green)]/10 rounded-lg border border-[var(--crisis-level-green)]/20">
        <h3 class="font-medium mb-2">{{ t('time.before') }}</h3>
        <p class="text-sm text-muted-foreground">{{ t('home.crisis_info.before') }}</p>
      </div>
      <div class="text-center p-4 bg-[var(--crisis-level-yellow)]/10 rounded-lg border border-[var(--crisis-level-yellow)]/20">
        <h3 class="font-medium mb-2">{{ t('time.during') }}</h3>
        <p class="text-sm text-muted-foreground">{{ t('home.crisis_info.during') }}</p>
      </div>
      <div class="text-center p-4 bg-[var(--crisis-level-red)]/10 rounded-lg border border-[var(--crisis-level-red)]/20">
        <h3 class="font-medium mb-2">{{ t('time.after') }}</h3>
        <p class="text-sm text-muted-foreground">{{ t('home.crisis_info.after') }}</p>
      </div>
    </div>
    <div class="mt-4 text-center">
      <Button
        variant="outline"
        class="border-[var(--crisis-level-red)]/30 text-[var(--crisis-level-red)] hover:bg-[var(--crisis-level-red)]/20 dark:hover:bg-[var(--crisis-level-red)]/40"
        @click="onLearnMoreClick"
      >
        {{ t('home.learn_more') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import type { CrisisEventPreviewDto } from '@/models/CrisisEvent.ts';

// Register FontAwesome icons
library.add(faTriangleExclamation);

const { t } = useI18n();

// Define props
const props = defineProps<{
  mainCrisis?: CrisisEventPreviewDto | null
}>();

// Define emits
const emit = defineEmits(['learn-more']);

/**
 * Emits the learn-more event when the learn more button is clicked
 */
const onLearnMoreClick = () => {
  emit('learn-more');
};
</script>
