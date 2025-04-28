import { ref, watch, onUnmounted } from 'vue';
import { connectNotificationSocket, disconnectNotificationSocket } from '@/services/api/WebSocketService';
import { useUserStore } from '@/stores/UserStore';
import type { NotificationMessage } from '@/models/Notification';

/**
 * Composable for managing WebSocket connections and notifications.
 *
 * @returns Object containing connection state and methods
 */
export function useWebSocket() {
  const userStore = useUserStore();
  const isConnected = ref(false);

  const handleNotification = (msg: NotificationMessage) => {
    console.log('WebSocket notification received:', msg);
    // TODO: Handle the notification (e.g., show toast, update UI)
  };

  const tryConnect = () => {
    const userId = userStore.userId;
    console.log('Attempting WebSocket connection:', { userId, loggedIn: userStore.loggedIn });
    if (userId && userStore.loggedIn) {
      connectNotificationSocket(userId, handleNotification);
      isConnected.value = true;
      console.log('WebSocket connection initiated');
    } else {
      console.log('WebSocket connection skipped:', {
        reason: !userId ? 'No userId' : 'Not logged in',
        userId,
        loggedIn: userStore.loggedIn
      });
      isConnected.value = false;
    }
  };

  const tryDisconnect = () => {
    console.log('Disconnecting WebSocket');
    disconnectNotificationSocket();
    isConnected.value = false;
  };

  // Watch for changes in login state
  watch(
    () => userStore.loggedIn,
    (loggedIn) => {
      console.log('Login state changed:', loggedIn);
      if (loggedIn) {
        tryConnect();
      } else {
        tryDisconnect();
      }
    },
    { immediate: true }
  );

  // Watch for userId changes
  watch(
    () => userStore.userId,
    (newUserId) => {
      console.log('User ID changed:', newUserId);
      if (newUserId && userStore.loggedIn) {
        tryConnect();
      }
    }
  );

  onUnmounted(() => {
    console.log('Component unmounting, cleaning up WebSocket');
    tryDisconnect();
  });

  return {
    isConnected,
    tryConnect,
    tryDisconnect
  };
}
