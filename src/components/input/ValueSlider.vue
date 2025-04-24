<template>
  <div class="slider-container">
    <label :for="name" class="block text-sm font-medium text-gray-700">{{ label }}</label>
    <input
      type="range"
      :id="name"
      :name="name"
      :min="min"
      :max="max"
      :step="step"
      v-model="sliderValue"
      @input="handleInput"
      class="w-full h-2 bg-gray-200 rounded-lg appearance-none"
    />
    <div class="flex justify-between text-sm text-gray-500">
      <span>{{ min }}</span>
      <span>{{ sliderValue }}</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props definition
interface SliderProps {
  modelValue: number | string;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  name?: string;
}

const props = withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  label: '',
  name: ''
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string): void;
}>()

// Computed property for two-way binding
const sliderValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Handle input change and emit update
const handleInput = () => {
  // This is now redundant with the computed property, but keeping it for compatibility
  emit('update:modelValue', sliderValue.value)
}
</script>
