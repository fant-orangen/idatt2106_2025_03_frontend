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

<script setup>
import { ref, watch } from 'vue'

// Props definition
const props = defineProps({
  value: {
    type: [Number, String],
    required: true,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
  label: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  }
})

// Local state for slider value
const sliderValue = ref(props.value)

// Watch for changes in `value` to keep the slider synced
watch(() => props.value, (newValue) => {
  sliderValue.value = newValue
})

// Handle input change and emit update
const handleInput = () => {
  emit('update:value', sliderValue.value)
}
</script>
