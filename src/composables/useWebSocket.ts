// src/composables/useWebSocket.ts

import { ref, watch } from 'vue';
import { useUserStore } from '@/stores/UserStore';
import { useNotificationStore } from '@/stores/NotificationStore';
import type { NotificationMessage } from '@/models/NotificationMessage'; // Import the type definition
import SockJS from 'sockjs-client';
import { Client, over, Frame } from 'stompjs'; // Added Frame for detailed error logging
import { toast } from 'vue-sonner'; // Import the toast function

/**
 * Composable for managing WebSocket connections and notifications.
 * Connects when the user is logged in and subscribes to user-specific notifications.
 * Displays crisis alerts using toast notifications.
 *
 * @returns Object containing connection state and control methods.
 */
export function useWebSocket() {
  const userStore = useUserStore();
  const notificationStore = useNotificationStore();
  const isConnected = ref(false);
  let stompClient: Client | null = null;
  let connectionAttempted = false; // Flag to prevent multiple concurrent connection attempts

  /**
   * Attempts to establish a WebSocket connection and subscribe to notifications.
   * Requires user to be logged in with a valid token and userId.
   */
  const tryConnect = () => {
    // Prevent multiple connection attempts or connecting if already connected
    if (connectionAttempted || isConnected.value) {
      console.log('WebSocket connection attempt skipped (already connected or in progress). State:', { connectionAttempted: connectionAttempted, isConnected: isConnected.value });
      return;
    }

    // Ensure necessary user data is available in the store
    if (!userStore.loggedIn || !userStore.userId || !userStore.token) {
      console.log('Cannot connect WebSocket: Missing required state', {
        loggedIn: userStore.loggedIn,
        userId: userStore.userId,
        hasToken: !!userStore.token
      });
      return;
    }

    console.log('Attempting WebSocket connection...');
    connectionAttempted = true; // Set flag indicating an attempt is in progress
    isConnected.value = false; // Ensure connection status is false initially

    try {
      // 1. Create SockJS connection
      const socket = new SockJS('http://localhost:8080/ws');
      stompClient = over(socket);

      // Optional: Disable STOMP debug logging in production
      // stompClient.debug = null;
      stompClient.debug = (str) => { console.log('STOMP Debug:', str); }; // Keep for debugging

      // 2. Connect using STOMP
      stompClient.connect(
        {
          // Pass JWT token for authentication (backend needs to handle this)
          // Note: Spring Security might handle this via interceptors rather than headers here.
          // If using interceptors, this header might be redundant but often kept.
          Authorization: `Bearer ${userStore.token}`
        },
        // --- Success Callback ---
        () => {
          const topic = `/topic/notifications/${userStore.userId}`;
          console.log('WebSocket connected successfully! Subscribing to topic:', topic);
          isConnected.value = true; // Update connection state

          if (!stompClient) {
            console.error('Stomp client became null unexpectedly after connection.');
            // Reset state if client is lost
            isConnected.value = false;
            connectionAttempted = false;
            return;
          }

          // 3. Subscribe to the user-specific notification topic
          stompClient.subscribe(
            topic,
            // --- Message Handler Callback ---
            (message) => {
              console.log('Received raw message body:', message.body);
              if (message.body) {
                try {
                  // Parse the JSON message body into our NotificationMessage type
                  const notification: NotificationMessage = JSON.parse(message.body);
                  console.log('Parsed notification:', notification);
                  console.log('Notification readAt status:', notification.readAt);

                  // Add the notification to the store
                  console.log('WebSocket: Adding notification to store. Current hasUnread:', notificationStore.hasUnread);
                  notificationStore.addNotification(notification);
                  console.log('WebSocket: Notification added to store. New hasUnread:', notificationStore.hasUnread);

                  // *** Frontend Improvement: Handle specific notification types ***
                  if (notification.preferenceType === 'crisis_alert') {
                    // Display the crisis alert using a warning toast
                    toast.warning('🚨 Crisis Alert!', {
                      description: notification.description || 'A new crisis event affects your area.',
                      duration: 10000, // Show for 10 seconds
                      // You can add more Sonner options here if needed
                    });
                  } else {
                    // Handle other notification types (e.g., 'expiration_reminder')
                    // For now, just log them or show a generic info toast
                    console.log('Received other notification type:', notification.preferenceType);
                    toast.info(`Notification: ${notification.description || 'Update received.'}`);
                  }
                  // *** End Frontend Improvement ***

                } catch (error) {
                  console.error('Error parsing notification JSON:', error, 'Raw message:', message.body);
                  toast.error('Received an invalid notification format.'); // Inform user about parsing error
                }
              } else {
                console.warn('Received empty message body');
              }
            },
            // --- Subscription Error Callback ---
            (error: Frame | string) => { // Handle potential Frame object or string error
              console.error('Error in STOMP subscription callback:', error);
              // Potentially try to resubscribe or notify user
              toast.error('Lost connection to notification channel.');
              isConnected.value = false; // Assume disconnect on subscription error
              // Consider triggering disconnect/reconnect logic here
              tryDisconnect();
            }
          );
          console.log('Successfully subscribed to topic:', topic);
          // connectionAttempted = false; // Reset flag after successful connection and subscription
          // Keep connectionAttempted=true while connected to prevent re-attempts by watchers if state briefly flickers
        },
        // --- Connection Error Callback ---
        (error: Frame | string) => {
          console.error('WebSocket connection error:', error);
          if (error instanceof Frame) {
            console.error('STOMP Frame details:', { command: error.command, headers: error.headers, body: error.body });
            toast.error(`Connection Error: ${(error.headers as Record<string, string>)?.message || 'Check console'}`);
          } else {
            toast.error(`Connection Error: ${error}`);
          }
          isConnected.value = false;
          connectionAttempted = false; // Reset flag on failed connection attempt
          stompClient = null; // Clean up client instance
        }
      );
    } catch (error) {
      console.error('Failed to initialize SockJS/STOMP connection:', error);
      isConnected.value = false;
      connectionAttempted = false; // Reset flag on initialization error
      stompClient = null; // Ensure client is null
      toast.error('Failed to set up notification connection.');
    }
  };

  /**
   * Disconnects the WebSocket connection if it's active.
   */
  const tryDisconnect = () => {
    console.log('Attempting to disconnect WebSocket...');
    if (stompClient) {
      try {
        if (stompClient.connected) {
          stompClient.disconnect(() => {
            // This callback might not always fire reliably depending on server/network state
            console.log('WebSocket disconnect callback fired.');
          });
          console.log('Disconnect initiated.');
        } else {
          console.log('WebSocket client existed but was not connected.');
        }
      } catch (error) {
        console.error('Error during WebSocket disconnect method call:', error);
      } finally {
        // --- Crucial Cleanup ---
        stompClient = null; // Ensure client instance is cleared
        isConnected.value = false; // Update connection state
        connectionAttempted = false; // Reset attempt flag
        console.log('WebSocket client nulled, connection state updated, attempt flag reset.');
        // --- End Crucial Cleanup ---
      }
    } else {
      console.log('No active stompClient instance to disconnect.');
      // Ensure state consistency even if client was already null
      isConnected.value = false;
      connectionAttempted = false;
    }
  };

  // --- Watchers to automatically connect/disconnect based on user state ---

  // Watch for changes in login state (isAuthenticated includes token validation)
  watch(
    () => userStore.isAuthenticated, // Use isAuthenticated for a more reliable state check
    (isAuth, wasAuth) => {
      console.log(`Authentication state changed: ${wasAuth} -> ${isAuth}`);
      if (isAuth) {
        // Attempt connection only if authenticated and not already connected/attempting
        if (!isConnected.value && !connectionAttempted) {
          console.log('User is authenticated, attempting WebSocket connection...');
          tryConnect();
        } else {
          console.log('User authenticated, but WebSocket connection already active or attempt in progress.');
        }
      } else {
        // If user becomes unauthenticated, disconnect
        console.log('User is not authenticated, ensuring WebSocket is disconnected...');
        tryDisconnect();
      }
    },
    { immediate: false } // Run on mount after initial store check if needed via onMounted in App.vue or here
  );

  // Optional: Watch userId specifically if it might become available *after* isAuthenticated is true
  // Usually covered by the isAuthenticated watcher, but can add robustness.
  watch(
    () => userStore.userId,
    (newUserId, oldUserId) => {
      console.log(`User ID changed: ${oldUserId} -> ${newUserId}`);
      if (newUserId && userStore.isAuthenticated && !isConnected.value && !connectionAttempted) {
        console.log('User ID available while authenticated, attempting WebSocket connection...');
        tryConnect();
      } else if (!newUserId && isConnected.value) {
        console.log('User ID became null, disconnecting WebSocket...');
        tryDisconnect(); // Disconnect if userId is lost while connected
      }
    }
  );

  // Return the connection state and control methods
  return {
    isConnected, // Reactive ref indicating connection status
    tryConnect, // Method to manually initiate connection attempt (if needed)
    tryDisconnect // Method to manually disconnect
  };
}
