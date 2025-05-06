<template>
  <div :class="[
    'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
    $attrs.class
  ]">
    <h3 v-if="showTitle" class="font-medium text-sm mb-2">{{ title }}</h3>
    <div class="grid grid-cols-3 gap-x-4 gap-y-2 md:grid-cols-6">
      <template v-for="item in items" :key="item.label">
        <div class="flex items-center gap-2">
          <!-- Pin icons (user/home) keep natural aspect ratio -->
          <template v-if="item.icon">
            <img
                    :src="item.icon"
                    :class="['h-9 w-auto', item.extraClass]"
                    alt=""
                  />
          </template>
          <!-- Crisis-level circles -->
          <template v-else-if="item.iconClass">
            <div
              :class="['w-6 h-6 rounded-full', item.iconClass]"
            />
          </template>
          <span class="text-sm">{{ item.label }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface LegendItem {
  icon?: string
  iconClass?: string
  extraClass?: string
  label: string
}

const props = defineProps({
  items: {
    type: Array as () => LegendItem[],
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  showTitle: {
    type: Boolean,
    default: true
  }
})
</script>
