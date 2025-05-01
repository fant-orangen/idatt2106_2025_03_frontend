import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

interface UseInfiniteScrollOptions {
  /** Whether data is currently being loaded */
  isLoading: boolean;
  /** Whether there is more data to load */
  hasMore: boolean;
  /** Distance in pixels from the bottom to trigger loading more (default: 200) */
  threshold?: number;
  /** Whether to use IntersectionObserver instead of scroll events (default: true) */
  useObserver?: boolean;
  /** Whether to check if content is smaller than container and load more if needed */
  checkSmallContent?: boolean;
  /** Root element to use as the viewport for checking visibility (default: null) */
  root?: HTMLElement | null;
}

/**
 * A composable for implementing infinite scrolling functionality
 *
 * @param callback Function to call when more data should be loaded
 * @param options Configuration options
 * @returns Object containing the target element ref
 */
export function useInfiniteScroll(
  callback: () => void,
  options: UseInfiniteScrollOptions
) {
  // Default options
  const threshold = options.threshold ?? 200;
  const useObserver = options.useObserver ?? true;
  const checkSmallContent = options.checkSmallContent ?? true;

  // Refs
  const target = ref<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;

  // Handle scroll events for browsers that don't support IntersectionObserver
  function handleScroll(event: Event) {
    if (options.isLoading || !options.hasMore) return;

    const target = event.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    if (scrollHeight - scrollTop - clientHeight <= threshold) {
      callback();
    }
  }

  // Check if content is smaller than container and load more if needed
  function checkContentSize() {
    if (!checkSmallContent || options.isLoading || !options.hasMore) return;

    // Find the scrollable parent element
    const scrollableParent = findScrollableParent(target.value);
    if (!scrollableParent) return;

    const { scrollHeight, clientHeight } = scrollableParent;

    // If content doesn't fill the container, load more
    if (scrollHeight <= clientHeight) {
      callback();
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
    if (!useObserver || !target.value) return;

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !options.isLoading && options.hasMore) {
          callback();
        }
      },
      {
        root: options.root || null,
        rootMargin: `0px 0px ${threshold}px 0px`, // Bottom margin
        threshold: 0 // Trigger as soon as any part is visible
      }
    );

    observer.observe(target.value);
  }

  // Setup scroll event listeners if not using IntersectionObserver
  function setupScrollListeners() {
    if (useObserver || !target.value) return;

    const scrollableParent = findScrollableParent(target.value);
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

    if (!useObserver && target.value) {
      const scrollableParent = findScrollableParent(target.value);
      if (scrollableParent) {
        scrollableParent.removeEventListener('scroll', handleScroll);
      }
    }
  }

  onMounted(() => {
    nextTick(() => {
      if (useObserver) {
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

  // Watch for changes in loading state
  watch(() => options.isLoading, (newVal) => {
    if (!newVal) {
      // When loading finishes, check if we need to load more
      nextTick(() => {
        setTimeout(checkContentSize, 100);
      });
    }
  });

  // Watch for changes in hasMore
  watch(() => options.hasMore, () => {
    if (useObserver && target.value && observer) {
      // Re-observe the target when hasMore changes
      observer.observe(target.value);
    }
  });

  return { target };
}
