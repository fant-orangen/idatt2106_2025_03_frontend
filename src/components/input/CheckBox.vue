<template>
  <label class="flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      :name="name"
      :checked="modelValue"
      :disabled="computedDisabled"
      @change="handleChange"
      class="form-checkbox h-4 w-4 text-primary border-gray-300 rounded"
    />
    <Text :class="labelClass" as="span">
      <slot>{{ label }}</slot>
    </Text>
  </label>
</template>

<script setup>
import Text from './Text.vue'
import { computed, defineProps, defineEmits } from 'vue'

/**
 * @typedef {Object} CheckboxProps
 * @property {boolean} modelValue - The checked state of the checkbox
 * @property {string} [label=''] - The text label for the checkbox
 * @property {string} [labelClass='text-sm text-gray-700'] - CSS classes for the label
 * @property {number} [maxAllowed=Infinity] - Maximum number of checkboxes that can be checked
 * @property {number} [checkedCount=0] - Current count of checked checkboxes
 * @property {string} [name=''] - Name attribute for the checkbox input
 * @property {string|number|Object} [value=null] - Value to emit when checkbox changes
 * @property {boolean} [isDisabled=false] - Whether the checkbox is disabled
 */

const props =defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  labelClass: {
    type: String,
    default: 'text-sm text-gray-700'
  },
  // New props for checkbox limitation
  maxAllowed: {
    type: Number,
    default: Infinity
  },
  checkedCount: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number, Object],
    default: null
  },
  isDisabled: {
    type: Boolean,
    default: false
  }
})
/**
 * @typedef {Object} CheckboxEmits
 * @property {(checked: boolean) => void} 'update:modelValue' - Emitted when checkbox state changes
 * @property {(data: {name: string, checked: boolean, value: any}) => void} 'change' - Emitted with checkbox data when state changes
 */
const emit = defineEmits(['update:modelValue', 'change'])

/**
 * Determines if the checkbox should be disabled based on check count and current state
 * @type {import('vue').ComputedRef<boolean>}
 */
const computedDisabled = computed(() => {
  // If already checked, should always be allowed to uncheck
  if (props.modelValue) {
    return false
  }
  // Otherwise, disable if max number of checkboxes already selected or explicitly disabled
  return props.isDisabled || props.checkedCount >= props.maxAllowed
})

/**
 * Handles checkbox change events and emits appropriate events
 * @param {Event} event - The change event
 */
const handleChange = (event) => {
  const checked = event.target.checked
  emit('update:modelValue', checked)
  emit('change', {
    name: props.name,
    checked: checked,
    value: props.value
  })
}
</script>
