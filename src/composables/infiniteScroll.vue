<!-- components/common/InfiniteScroll.vue -->
<template>
  <div>
    <slot />
    <div v-if="isLoading" class="loading-indicator">
      <p>Loading more items...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, nextTick } from 'vue';

interface Props {
  isLoading: boolean;
  hasMore: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'load-more'): void;
}>();

function onScroll() {
  const scrollThreshold = 200;
  const scrollPosition = window.innerHeight + window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight;

  if (
    scrollPosition >= scrollHeight - scrollThreshold &&
    !props.isLoading &&
    props.hasMore
  ) {
    emit('load-more');
  }
}

function maybeLoadMoreIfNotScrollable() {
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = window.innerHeight;

  if (scrollHeight <= clientHeight && !props.isLoading && props.hasMore) {
    emit('load-more');
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll);
  nextTick(() => {
    setTimeout(maybeLoadMoreIfNotScrollable, 100);
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

watch(() => props.isLoading, (newVal) => {
  if (!newVal) {
    nextTick(() => {
      setTimeout(maybeLoadMoreIfNotScrollable, 100);
    });
  }
});
</script>

<style scoped>
.loading-indicator {
  text-align: center;
  margin: 1rem 0;
}
</style>
