<template>
  <span
    :class="cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      variantClasses[variant]
    )"
  >
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils' // Make sure you have this helper

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (v) =>
      ['default', 'secondary', 'destructive', 'outline'].includes(v)
  }
})

const variantClasses = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-destructive-foreground',
  outline: 'text-foreground'
}
</script>
