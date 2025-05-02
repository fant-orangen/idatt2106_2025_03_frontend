// src/stores/NotificationStore.ts
import { defineStore } from 'pinia';
import { ref, computed, onMounted } from 'vue'; // Import computed and onMounted
import type { NotificationMessage } from '@/models/NotificationMessage';
// Assuming NotificationService.ts exports getNotifications
import { getNotifications } from '@/services/NotificationService';

// Local storage keys
const NOTIFICATIONS_STORAGE_KEY = 'notifications';
const HAS_FETCHED_INITIAL_KEY = 'hasFetchedInitial';

export const useNotificationStore = defineStore('notification', () => {
  // --- State ---
  // Holds the list of notifications, newest first
  const notifications = ref<NotificationMessage[]>([]);
  // Tracks loading state for initial fetch
  const isLoading = ref(false);
  // Holds any error message from fetching
  const error = ref<string | null>(null);
  // Tracks if the initial fetch has been attempted/completed
  const hasFetchedInitial = ref(false);

  // Load persisted state from localStorage on store initialization
  onMounted(() => {
    loadFromLocalStorage();
  });

  // Function to load state from localStorage
  function loadFromLocalStorage() {
    try {
      const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const storedHasFetchedInitial = localStorage.getItem(HAS_FETCHED_INITIAL_KEY);

      if (storedNotifications) {
        // Parse the stored notifications and convert date strings back to Date objects
        const parsedNotifications = JSON.parse(storedNotifications);
        notifications.value = parsedNotifications.map((notification: any) => ({
          ...notification,
          notifyAt: new Date(notification.notifyAt),
          sentAt: notification.sentAt ? new Date(notification.sentAt) : undefined,
          readAt: notification.readAt ? new Date(notification.readAt) : undefined,
          createdAt: new Date(notification.createdAt)
        }));
      }

      if (storedHasFetchedInitial) {
        hasFetchedInitial.value = JSON.parse(storedHasFetchedInitial);
      }
    } catch (err) {
      console.error('Failed to load notifications from localStorage:', err);
      // If there's an error loading from localStorage, we'll just use the default empty state
    }
  }

  // Function to save state to localStorage
  function saveToLocalStorage() {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications.value));
      localStorage.setItem(HAS_FETCHED_INITIAL_KEY, JSON.stringify(hasFetchedInitial.value));
    } catch (err) {
      console.error('Failed to save notifications to localStorage:', err);
    }
  }

  // --- Actions ---

  // Action to fetch initial/historical notifications from the backend
  async function fetchNotifications() {
    // Prevent multiple initial fetches
    if (isLoading.value || hasFetchedInitial.value) {
      console.log('Skipping fetchNotifications: Already loading or initial fetch done.');
      return;
    }

    console.log('NotificationStore: Fetching notifications...');
    isLoading.value = true;
    error.value = null;
    try {
      // Call the existing service function
      const fetchedNotifications = await getNotifications(); // Assume this returns NotificationMessage[]

      // Sort by createdAt descending (newest first) for consistent display
      notifications.value = fetchedNotifications.content.sort((a: NotificationMessage, b: NotificationMessage) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      hasFetchedInitial.value = true; // Mark initial fetch as done

      // Persist to localStorage
      saveToLocalStorage();

      console.log(`NotificationStore: Fetched ${notifications.value.length} notifications.`);
    } catch (err) {
      console.error('NotificationStore: Failed to fetch notifications:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load notifications';
      hasFetchedInitial.value = false; // Allow retrying if fetch fails
    } finally {
      isLoading.value = false;
    }
  }

  // Action to add a new notification received via WebSocket
  function addNotification(newNotification: NotificationMessage) {
    // Check if notification already exists by ID to prevent duplicates
    const exists = notifications.value.some(n => n.id === newNotification.id);
    if (!exists) {
      // Add to the beginning of the array (newest first)
      notifications.value.unshift(newNotification);

      // Persist to localStorage
      saveToLocalStorage();

      console.log('NotificationStore: Added new notification via WebSocket:', newNotification.id);
    } else {
      console.log('NotificationStore: Notification already exists, skipping addition:', newNotification.id);
    }
  }

  // Action to reset the store (e.g., on logout)
  function resetStore() {
    console.log('NotificationStore: Resetting store.');
    notifications.value = [];
    isLoading.value = false;
    error.value = null;
    hasFetchedInitial.value = false;

    // Clear localStorage
    try {
      localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      localStorage.removeItem(HAS_FETCHED_INITIAL_KEY);
    } catch (err) {
      console.error('Failed to clear notifications from localStorage:', err);
    }
  }

  // --- Getters (Computed Properties) ---

  // Example: Get unread notification count
  const unreadCount = computed(() => notifications.value.filter(n => !n.readAt).length);

  // Example: Get only the latest few notifications for the popover
  const latestNotifications = computed(() => notifications.value.slice(0, 5));


  // --- Store Interface ---
  return {
    // State refs
    notifications,
    isLoading,
    error,
    hasFetchedInitial, // Expose this if needed externally

    // Actions
    fetchNotifications,
    addNotification,
    resetStore, // Expose reset action

    // Computed Getters
    unreadCount,
    latestNotifications // Expose computed slice for popover
  };
});
