<template>
  <div class="flex-col items-center space-y-2 w-full md:fex-row md:space-x-4">
    <input
      v-model="searchText"
      @input="onInput"
      type="text"
      class="flex-1 w-full bg-input text-foreground py-2 px-3 rounded-md border border-border"
      placeholder="Søk..."
    />
    <button class="bg-muted text-foreground px-4 py-2 rounded-md border border-border" @click="clearSearch">
      Opphev søk
    </button>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
/**
 * Emits:
 *   update:search (string) - emitted on every input change and when cleared
 */
const emit = defineEmits(['update:search']);
const searchText = ref('');

function onInput() {
  emit('update:search', searchText.value);
}

function clearSearch() {
  searchText.value = '';
  emit('update:search', '');
}
</script>
