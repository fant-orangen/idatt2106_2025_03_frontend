import { ref, watch } from 'vue';
import { useUserStore } from '@/stores/UserStore';
import type { NotificationMessage } from '@/models/Notification';
import SockJS from 'sockjs-client';
import { Client, over } from 'stompjs';

/**
 * Composable for managing WebSocket connections and notifications.
 *
 * @returns Object containing connection state and methods
 */
export function useWebSocket() {
  const userStore = useUserStore();
  const isConnected = ref(false);
  let stompClient: Client | null = null;
  let connectionAttempted = false;

  const handleNotification = (message: NotificationMessage) => {
    console.log('Received notification:', message);
    // Handle notification logic here
  };

  const tryConnect = () => {
    // Prevent multiple connection attempts
    if (connectionAttempted) {
      console.log('Connection already attempted, skipping...');
      return;
    }

    console.log('Attempting WebSocket connection with state:', {
      loggedIn: userStore.loggedIn,
      userId: userStore.userId,
      isConnected: isConnected.value,
      token: userStore.token ? 'present' : 'missing'
    });

    if (!userStore.loggedIn || !userStore.userId || !userStore.token) {
      console.log('Cannot connect: Missing required state', {
        loggedIn: userStore.loggedIn,
        userId: userStore.userId,
        hasToken: !!userStore.token
      });
      return;
    }

    if (stompClient?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    connectionAttempted = true;

    try {
      console.log('Creating new SockJS connection...');
      const socket = new SockJS('http://localhost:8080/ws');
      stompClient = over(socket);

      // Enable debug logging for troubleshooting
      stompClient.debug = (str) => {
        console.log('STOMP Debug:', str);
      };

      console.log('Attempting to connect to WebSocket server...');
      stompClient.connect(
        {
          Authorization: `Bearer ${userStore.token}`
        },
        () => {
          const topic = `/topic/notifications/${userStore.userId}`;
          console.log('WebSocket connected, subscribing to topic:', topic);

          if (!stompClient) {
            console.error('Stomp client is null after connection');
            return;
          }

          // Wait a short moment to ensure the connection is fully established
          setTimeout(() => {
            stompClient?.subscribe(
              topic,
              (message) => {
                console.log('Received raw message:', message);
                if (message.body) {
                  try {
                    const notification = JSON.parse(message.body) as NotificationMessage;
                    console.log('Parsed notification:', notification);
                    handleNotification(notification);
                  } catch (error) {
                    console.error('Error parsing notification:', error, 'Raw message:', message.body);
                  }
                } else {
                  console.warn('Received empty message body');
                }
              },
              (error: Error) => {
                console.error('Error in subscription callback:', error);
              }
            );
            console.log('Successfully subscribed to topic:', topic);
            isConnected.value = true;
          }, 100);
        },
        (error) => {
          console.error('WebSocket connection error:', error);
          isConnected.value = false;
          connectionAttempted = false;
        }
      );
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      isConnected.value = false;
      connectionAttempted = false;
    }
  };

  const tryDisconnect = () => {
    console.log('Attempting to disconnect WebSocket');
    if (stompClient) {
      try {
        if (stompClient.connected) {
          stompClient.disconnect(() => {
            console.log('WebSocket disconnected');
          });
        } else {
          console.log('WebSocket was not connected');
        }
        stompClient = null;
      } catch (error) {
        console.error('Error disconnecting from WebSocket:', error);
      }
    }
    isConnected.value = false;
    connectionAttempted = false;
  };

  // Watch for changes in login state
  watch(
    () => userStore.loggedIn,
    (newLoggedIn) => {
      console.log('Login state changed:', newLoggedIn);
      if (newLoggedIn) {
        tryConnect();
      } else {
        tryDisconnect();
      }
    }
  );

  // Watch for changes in userId
  watch(
    () => userStore.userId,
    (newUserId) => {
      console.log('User ID changed:', newUserId);
      if (newUserId && userStore.loggedIn) {
        tryConnect();
      }
    }
  );

  return {
    isConnected,
    tryConnect,
    tryDisconnect
  };
}
