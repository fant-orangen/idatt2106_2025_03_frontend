// src/stores/NotificationStore.ts
import { defineStore } from 'pinia';
import { ref, computed, onMounted } from 'vue'; // Import onMounted
import type { NotificationMessage } from '@/models/NotificationMessage';
import { getNotifications } from '@/services/NotificationService'; // Assuming this service exists and works
import type { Page } from '@/types/Page'; // Import Page type if getNotifications returns it

// --- Constants ---
const DEFAULT_PAGE_SIZE = 20; // Define default page size
const NOTIFICATIONS_STORAGE_KEY = 'notifications';
const HAS_FETCHED_INITIAL_KEY = 'hasFetchedInitial';
const CURRENT_PAGE_KEY = 'notificationsCurrentPage';
const TOTAL_PAGES_KEY = 'notificationsTotalPages';
const PAGE_SIZE_KEY = 'notificationsPageSize';

export const useNotificationStore = defineStore('notification', () => {
  // --- State ---
  const notifications = ref<NotificationMessage[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const hasFetchedInitial = ref(false); // Tracks if *backend* initial fetch was done
  const currentPage = ref(0); // 0-based index
  const totalPages = ref(0);
  const pageSize = ref(DEFAULT_PAGE_SIZE);

  // --- Computed ---
  // Determines if there are more pages to load from the backend
  const hasMoreNotifications = computed(() => currentPage.value < totalPages.value - 1);

  // --- Persistence Functions ---
  function loadFromLocalStorage() {
    console.log('NotificationStore: Loading from localStorage...');
    try {
      const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const storedHasFetchedInitial = localStorage.getItem(HAS_FETCHED_INITIAL_KEY);
      const storedCurrentPage = localStorage.getItem(CURRENT_PAGE_KEY);
      const storedTotalPages = localStorage.getItem(TOTAL_PAGES_KEY);
      const storedPageSize = localStorage.getItem(PAGE_SIZE_KEY);

      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        // Convert date strings back to Date objects
        notifications.value = parsedNotifications.map((n: any) => ({
          ...n,
          notifyAt: new Date(n.notifyAt),
          sentAt: n.sentAt ? new Date(n.sentAt) : undefined,
          readAt: n.readAt ? new Date(n.readAt) : undefined,
          createdAt: new Date(n.createdAt)
        }));
        console.log(`Loaded ${notifications.value.length} notifications from storage.`);
      } else {
        notifications.value = []; // Ensure it's empty if nothing in storage
      }

      if (storedHasFetchedInitial) {
        hasFetchedInitial.value = JSON.parse(storedHasFetchedInitial);
        console.log(`Loaded hasFetchedInitial: ${hasFetchedInitial.value}`);
      } else {
        hasFetchedInitial.value = false;
      }

      if (storedCurrentPage) {
        currentPage.value = JSON.parse(storedCurrentPage);
        console.log(`Loaded currentPage: ${currentPage.value}`);
      } else {
        currentPage.value = 0;
      }

      if (storedTotalPages) {
        totalPages.value = JSON.parse(storedTotalPages);
        console.log(`Loaded totalPages: ${totalPages.value}`);
      } else {
        totalPages.value = 0;
      }

      if (storedPageSize) {
        pageSize.value = JSON.parse(storedPageSize);
        console.log(`Loaded pageSize: ${pageSize.value}`);
      } else {
        pageSize.value = DEFAULT_PAGE_SIZE;
      }


    } catch (err) {
      console.error('Failed to load notification state from localStorage:', err);
      // Reset to defaults if loading fails
      resetStateRefs();
    }
  }

  function saveToLocalStorage() {
    try {
      console.log('NotificationStore: Saving to localStorage...');
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications.value));
      localStorage.setItem(HAS_FETCHED_INITIAL_KEY, JSON.stringify(hasFetchedInitial.value));
      localStorage.setItem(CURRENT_PAGE_KEY, JSON.stringify(currentPage.value));
      localStorage.setItem(TOTAL_PAGES_KEY, JSON.stringify(totalPages.value));
      localStorage.setItem(PAGE_SIZE_KEY, JSON.stringify(pageSize.value));
      console.log(`Saved: ${notifications.value.length} items, page ${currentPage.value}/${totalPages.value-1}, fetchedInitial: ${hasFetchedInitial.value}`);
    } catch (err) {
      console.error('Failed to save notification state to localStorage:', err);
    }
  }

  function clearLocalStorage() {
    try {
      localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      localStorage.removeItem(HAS_FETCHED_INITIAL_KEY);
      localStorage.removeItem(CURRENT_PAGE_KEY);
      localStorage.removeItem(TOTAL_PAGES_KEY);
      localStorage.removeItem(PAGE_SIZE_KEY);
      console.log('NotificationStore: Cleared localStorage.');
    } catch (err) {
      console.error('Failed to clear notifications from localStorage:', err);
    }
  }

  // Helper to reset state refs
  function resetStateRefs() {
    notifications.value = [];
    isLoading.value = false;
    error.value = null;
    hasFetchedInitial.value = false;
    currentPage.value = 0;
    totalPages.value = 0;
    pageSize.value = DEFAULT_PAGE_SIZE;
  }


  // --- Actions ---
  async function fetchNotifications(pageToFetch: number = 0, forceRefresh: boolean = false) {
    // Reset if forcing refresh
    if (forceRefresh) {
      console.log("NotificationStore: Forcing refresh, resetting state...");
      resetStateRefs(); // Reset refs but not localStorage yet
      pageToFetch = 0; // Start from page 0 on refresh
    }

    // If not forcing refresh, check if initial data is already fetched and persisted
    if (!forceRefresh && hasFetchedInitial.value) {
      console.log('Skipping initial fetch: Already done and persisted.');
      return;
    }

    // Prevent fetching if already loading or if trying to fetch beyond last page (unless forcing refresh)
    if (isLoading.value || (!forceRefresh && pageToFetch > 0 && !hasMoreNotifications.value)) {
      console.log('Skipping fetch: Loading or no more pages.', {isLoading: isLoading.value, hasMore: hasMoreNotifications.value, pageToFetch, forceRefresh});
      return;
    }

    console.log(`NotificationStore: Fetching page ${pageToFetch}...`);
    isLoading.value = true;
    error.value = null;

    try {
      // Service uses 1-based page index, backend usually 0-based. Adjust service call if needed.
      // Assuming getNotifications expects 1-based page index.
      const pageResult: Page<NotificationMessage> = await getNotifications(pageToFetch + 1, pageSize.value);

      // Convert date strings to Date objects *immediately* after fetch
      const freshNotifications = pageResult.content.map((n: any) => ({
        ...n,
        notifyAt: new Date(n.notifyAt),
        sentAt: n.sentAt ? new Date(n.sentAt) : undefined,
        readAt: n.readAt ? new Date(n.readAt) : undefined,
        createdAt: new Date(n.createdAt)
      }));

      if (pageToFetch === 0) {
        // First page load (or refresh): replace existing notifications
        notifications.value = freshNotifications;
      } else {
        // Subsequent page loads: append new notifications
        // Avoid duplicates just in case
        const currentIds = new Set(notifications.value.map(n => n.id));
        const uniqueNewNotifications = freshNotifications.filter(n => !currentIds.has(n.id));
        notifications.value = [...notifications.value, ...uniqueNewNotifications];
      }

      // Update pagination state from the Page object
      currentPage.value = pageResult.number ?? pageToFetch; // Use response number if available
      totalPages.value = pageResult.totalPages;
      pageSize.value = pageResult.size ?? DEFAULT_PAGE_SIZE; // Update size if needed
      hasFetchedInitial.value = true; // Mark initial fetch as done

      // Persist the updated state
      saveToLocalStorage();

      console.log(`NotificationStore: Fetched page ${currentPage.value}. Total pages: ${totalPages.value}. Total Items in store: ${notifications.value.length}`);

    } catch (err) {
      console.error(`NotificationStore: Failed to fetch notifications page ${pageToFetch}:`, err);
      error.value = err instanceof Error ? err.message : 'Failed to load notifications';
      // Don't reset hasFetchedInitial on error to avoid potential infinite loops on mount if API is down
    } finally {
      isLoading.value = false;
    }
  }

  // Action to fetch the next page specifically
  async function fetchNextPage() {
    if (hasMoreNotifications.value && !isLoading.value) {
      // Pass the *next* page number (current + 1)
      await fetchNotifications(currentPage.value + 1);
    } else {
      console.log("NotificationStore: No more pages to fetch or already loading.");
    }
  }

  // Action to add a new notification received via WebSocket (prepends)
  function addNotification(newNotification: NotificationMessage) {
    const exists = notifications.value.some(n => n.id === newNotification.id);
    if (!exists) {
      // Ensure dates are Date objects if coming from WebSocket potentially as strings
      const notificationWithDates = {
        ...newNotification,
        notifyAt: new Date(newNotification.notifyAt),
        sentAt: newNotification.sentAt ? new Date(newNotification.sentAt) : undefined,
        readAt: newNotification.readAt ? new Date(newNotification.readAt) : undefined,
        createdAt: new Date(newNotification.createdAt)
      };
      notifications.value.unshift(notificationWithDates); // Add to the beginning
      // Update pagination state? Maybe increment totalElements if backend doesn't handle this?
      // For simplicity, we might rely on the next full fetch to correct counts,
      // or adjust totalPages/totalElements if necessary, though it can get complex.
      saveToLocalStorage(); // Persist the updated list
      console.log('NotificationStore: Added new notification via WebSocket:', newNotification.id);
    } else {
      console.log('NotificationStore: Notification already exists, skipping addition:', newNotification.id);
    }
  }

  // Action to reset the store
  function resetStore() {
    console.log('NotificationStore: Resetting store and clearing localStorage.');
    resetStateRefs(); // Reset refs
    clearLocalStorage(); // Clear storage
  }

  // --- Initialization ---
  // Load state from localStorage when the store is initialized
  loadFromLocalStorage();

  // --- Computed Getters ---
  const unreadCount = computed(() => notifications.value.filter(n => !n.readAt).length);

  // latestNotifications for the Popover (keep limit low, e.g., 3 or 5)
  const latestNotifications = computed(() => {
    // Sort notifications by date first to ensure "latest" means newest
    // Make sure notifications are sorted before slicing
    const sortedNotifications = [...notifications.value].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sortedNotifications.slice(0, 3); // Keep limit to 3 for the popover
  });


  return {
    // State refs
    notifications,
    isLoading,
    error,
    hasFetchedInitial,
    currentPage, // Expose pagination state if needed elsewhere
    totalPages,
    pageSize,
    hasMoreNotifications, // Expose computed flag

    // Actions
    fetchNotifications, // Action to fetch specific page or refresh
    fetchNextPage,      // Specific action for infinite scroll
    addNotification,
    resetStore,

    // Computed Getters
    unreadCount,
    latestNotifications // Limited list for popover
  };
});
