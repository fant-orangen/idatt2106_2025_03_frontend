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

<script setup lang="ts">
import Text from './Text.vue'
import { computed } from 'vue'

/**
 * Interface for checkbox props
 */
interface CheckboxProps {
  modelValue: boolean;
  label?: string;
  labelClass?: string;
  maxAllowed?: number;
  checkedCount?: number;
  name?: string;
  value?: string | number | object | null;
  isDisabled?: boolean;
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  label: '',
  labelClass: 'text-sm text-gray-700',
  maxAllowed: Infinity,
  checkedCount: 0,
  name: '',
  value: null,
  isDisabled: false
});
/**
 * Interface for checkbox emits
 */
interface CheckboxEmits {
  (e: 'update:modelValue', checked: boolean): void;
  (e: 'change', data: {name: string, checked: boolean, value: string | number | object | null}): void;
}

const emit = defineEmits<CheckboxEmits>();

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
