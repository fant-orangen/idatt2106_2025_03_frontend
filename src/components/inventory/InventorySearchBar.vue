<template>
  <div class="flex-col items-center space-y-2 w-full md:fex-row md:space-x-4">
    <input
      v-model="searchText"
      @input="onInput"
      type="text"
      class="flex-1 w-full bg-input text-foreground py-2 px-3 rounded-md border border-border"
      :placeholder="t('inventory.search-placeholder')"
    />
    <Button
    class="mt-4 hover:cursor-pointer hover:bg-sidebar-primary/80 dark:hover:bg-sidebar-primary/10"
    @click="clearSearch">
      {{ t('inventory.search-clear') }}
    </Button>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
/**
 * Emits:
 *   update:search (string) - emitted on every input change and when cleared
 */
const emit = defineEmits(['update:search']);
const searchText = ref('');
const { t } = useI18n();

function onInput() {
  emit('update:search', searchText.value);
}

function clearSearch() {
  searchText.value = '';
  emit('update:search', '');
}
</script>
