<template>
  <div class="switch-container" @click="toggle" :class="{'switch-checked': modelValue}">
    <div class="switch-handle"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

function toggle() {
  emit('update:modelValue', !props.modelValue);
}
</script>
