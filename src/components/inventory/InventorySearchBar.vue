<template>
  <div class="flex items-center space-x-2 w-full">
    <input
      v-model="searchText"
      @input="onInput"
      type="text"
      class="flex-1 bg-input text-foreground py-2 px-3 rounded-md border border-border"
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
