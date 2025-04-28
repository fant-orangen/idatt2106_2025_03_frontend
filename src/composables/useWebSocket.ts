import { ref, watch, onUnmounted } from 'vue';
import { connectNotificationSocket, disconnectNotificationSocket } from '@/services/api/WebSocketService';
import { useUserStore } from '@/stores/UserStore';
import type { NotificationHandler } from '@/models/Notification';

/**
 * Composable for managing WebSocket connections and notifications.
 *
 * @param onNotification - Callback function to handle incoming notifications
 * @returns Object containing connection state and methods
 */
export function useWebSocket(onNotification: NotificationHandler) {
  const userStore = useUserStore();
  const isConnected = ref(false);

  const tryConnect = () => {
    if (!isConnected.value && userStore.loggedIn && userStore.profile?.id) {
      try {
        connectNotificationSocket(onNotification);
        isConnected.value = true;
        console.log('WebSocket connected successfully');
      } catch (error) {
        console.error('Failed to connect to notification socket:', error);
        isConnected.value = false;
      }
    }
  };

  const tryDisconnect = () => {
    if (isConnected.value) {
      try {
        disconnectNotificationSocket();
        isConnected.value = false;
        console.log('WebSocket disconnected successfully');
      } catch (error) {
        console.error('Error disconnecting from notification socket:', error);
      }
    }
  };

  // Watch for changes in login/profile state
  watch(
    () => [userStore.loggedIn, userStore.profile?.id],
    ([loggedIn, id]) => {
      if (loggedIn && id) {
        tryConnect();
      } else {
        tryDisconnect();
      }
    },
    { immediate: true }
  );

  // Watch for profile changes to ensure we have the latest ID
  watch(
    () => userStore.profile,
    (newProfile) => {
      if (newProfile?.id && userStore.loggedIn) {
        tryConnect();
      }
    },
    { deep: true }
  );

  onUnmounted(() => {
    tryDisconnect();
  });

  return {
    isConnected
  };
}
