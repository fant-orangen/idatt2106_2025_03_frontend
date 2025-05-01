<!-- InfiniteScroll.vue -->
<template>
  <div class="infinite-scroll-wrapper">
    <!-- Main content slot -->
    <slot />

    <!-- Loading indicator -->
    <div v-if="isLoading" class="infinite-scroll-loading">
      <slot name="loading">
        <div class="default-loading-indicator">
          <div class="spinner"></div>
          <p v-if="loadingText" class="loading-text">{{ loadingText }}</p>
        </div>
      </slot>
    </div>

    <!-- End message when no more content -->
    <div v-if="!hasMore && !isLoading && showEndMessage" class="infinite-scroll-end">
      <slot name="end-message">
        <p class="end-message-text">{{ endMessage }}</p>
      </slot>
    </div>

    <!-- Invisible trigger element that's observed by IntersectionObserver -->
    <div ref="observerTarget" class="observer-target"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

interface Props {
  /** Whether data is currently being loaded */
  isLoading: boolean;
  /** Whether there is more data to load */
  hasMore: boolean;
  /** Text to display while loading (optional) */
  loadingText?: string;
  /** Text to display when there's no more data (optional) */
  endMessage?: string;
  /** Whether to show the end message when there's no more data */
  showEndMessage?: boolean;
  /** Distance in pixels from the bottom to trigger loading more (default: 200) */
  threshold?: number;
  /** Whether to use IntersectionObserver instead of scroll events (default: true) */
  useObserver?: boolean;
  /** Whether to check if content is smaller than container and load more if needed */
  checkSmallContent?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loadingText: '',
  endMessage: 'No more items to load',
  showEndMessage: true,
  threshold: 200,
  useObserver: true,
  checkSmallContent: true
});

const emit = defineEmits<{
  (e: 'load-more'): void;
}>();

// Refs
const observerTarget = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// Handle scroll events for browsers that don't support IntersectionObserver
function handleScroll(event: Event) {
  if (props.isLoading || !props.hasMore) return;

  const target = event.target as HTMLElement;
  const { scrollTop, scrollHeight, clientHeight } = target;

  if (scrollHeight - scrollTop - clientHeight <= props.threshold) {
    emit('load-more');
  }
}

// Check if content is smaller than container and load more if needed
function checkContentSize() {
  if (!props.checkSmallContent || props.isLoading || !props.hasMore) return;

  // Find the scrollable parent element
  const scrollableParent = findScrollableParent(observerTarget.value);
  if (!scrollableParent) return;

  const { scrollHeight, clientHeight } = scrollableParent;

  // If content doesn't fill the container, load more
  if (scrollHeight <= clientHeight) {
    emit('load-more');
  }
}

// Find the first scrollable parent element
function findScrollableParent(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null;

  let parent = element.parentElement;
  while (parent) {
    const { overflow, overflowY } = getComputedStyle(parent);
    if (
      overflow === 'auto' ||
      overflow === 'scroll' ||
      overflowY === 'auto' ||
      overflowY === 'scroll'
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }

  // If no scrollable parent is found, use document.documentElement
  return document.documentElement;
}

// Setup IntersectionObserver
function setupObserver() {
  if (!props.useObserver || !observerTarget.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !props.isLoading && props.hasMore) {
        emit('load-more');
      }
    },
    {
      root: null, // Use viewport as root
      rootMargin: `0px 0px ${props.threshold}px 0px`, // Bottom margin
      threshold: 0 // Trigger as soon as any part is visible
    }
  );

  observer.observe(observerTarget.value);
}

// Setup scroll event listeners if not using IntersectionObserver
function setupScrollListeners() {
  if (props.useObserver || !observerTarget.value) return;

  const scrollableParent = findScrollableParent(observerTarget.value);
  if (scrollableParent) {
    scrollableParent.addEventListener('scroll', handleScroll);
  }
}

// Cleanup
function cleanup() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (!props.useObserver && observerTarget.value) {
    const scrollableParent = findScrollableParent(observerTarget.value);
    if (scrollableParent) {
      scrollableParent.removeEventListener('scroll', handleScroll);
    }
  }
}

onMounted(() => {
  nextTick(() => {
    if (props.useObserver) {
      setupObserver();
    } else {
      setupScrollListeners();
    }

    // Check if we need to load more content initially
    setTimeout(checkContentSize, 100);
  });
});

onUnmounted(() => {
  cleanup();
});

// Watch for changes in props
watch(() => props.isLoading, (newVal) => {
  if (!newVal) {
    // When loading finishes, check if we need to load more
    nextTick(() => {
      setTimeout(checkContentSize, 100);
    });
  }
});

// Re-setup observer if useObserver changes
watch(() => props.useObserver, (newVal) => {
  cleanup();
  nextTick(() => {
    if (newVal) {
      setupObserver();
    } else {
      setupScrollListeners();
    }
  });
});
</script>

<style scoped>
.infinite-scroll-wrapper {
  position: relative;
}

.infinite-scroll-loading,
.infinite-scroll-end {
  text-align: center;
  padding: 0.5rem 0;
}

.default-loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary, #3b82f6);
  animation: spin 0.8s linear infinite;
}

.loading-text,
.end-message-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--muted-foreground, #6b7280);
}

.observer-target {
  width: 100%;
  height: 1px;
  visibility: hidden;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
