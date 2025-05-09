<template>
  <div class="household-info bg-card p-6 rounded-lg border border-[var(--crisis-level-green)]/30">
    <h2 class="text-xl font-bold mb-3 flex items-center">
      <font-awesome-icon :icon="['fas', 'home']" class="mr-2 text-[var(--crisis-level-green)]" />
      {{ t('home.household.title') }}
    </h2>
    <p class="mb-4 text-muted-foreground">{{ t('home.household.description') }}</p>
    <ul class="list-disc list-inside space-y-2 mb-4 text-muted-foreground">
      <li>{{ t('home.household.feature1') }}</li>
      <li>{{ t('home.household.feature2') }}</li>
      <li>{{ t('home.household.feature3') }}</li>
    </ul>
    <div class="mt-4 text-center">
      <Button 
        class="bg-[var(--crisis-level-green)] hover:bg-[var(--crisis-level-green)]/75"
        @click="onCreateClick"
      >
        {{ t('home.household.create_button') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHome } from '@fortawesome/free-solid-svg-icons';

// Register FontAwesome icons
library.add(faHome);

const { t } = useI18n();

// Define emits
const emit = defineEmits(['create']);

/**
 * Emits the create event when the create button is clicked
 */
const onCreateClick = () => {
  emit('create');
};
</script>
