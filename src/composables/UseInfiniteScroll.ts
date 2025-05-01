import { ref, onMounted, onUnmounted } from 'vue';

export function useInfiniteScroll(callback: () => void, options: { root?: HTMLElement | null } = {}) {
  const target = ref<HTMLElement | null>(null);
  const observer = ref<IntersectionObserver | null>(null);

  const createObserver = () => {
    if (observer.value) observer.value.disconnect();
    console.log('Creating IntersectionObserver'); // Debugging

    observer.value = new IntersectionObserver(
      (entries) => {
        console.log('IntersectionObserver entries:', entries); // Debugging
        if (entries[0].isIntersecting) {
          console.log('Intersection triggered'); // Debugging
          callback();
        }
      },
      {
        root: options.root || null,
        rootMargin: '0px', // Adjusted margin
        threshold: 0.1, // Adjusted threshold to trigger when 50% of the element is visible
      }
    );

    if (target.value) {
      console.log('Observing target element:', target.value); // Debugging
      observer.value.observe(target.value);
    } else {
      console.log('Target element not found!');
    }
  };

  onMounted(createObserver);

  onUnmounted(() => {
    if (observer.value && target.value) {
      console.log('Disconnecting observer'); // Debugging
      observer.value.unobserve(target.value);
    }
  });

  return { target };
}
