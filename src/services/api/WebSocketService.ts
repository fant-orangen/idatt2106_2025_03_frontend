import SockJS from 'sockjs-client';
import { Client, over, Frame } from 'stompjs';
import { useUserStore } from '@/stores/UserStore';

// Ensure global is defined for SockJS
if (typeof window !== 'undefined') {
  (window as any).global = window;
}

interface NotificationMessage {
  id: number;
  userId: number;
  message: string;
  timestamp: string;
}

let stompClient: Client | null = null;

export function connectNotificationSocket(onNotification: (msg: NotificationMessage) => void) {
  const userStore = useUserStore();
  const userId = userStore.profile?.id;

  if (!userId) {
    console.warn('No user ID available, cannot connect to notification socket');
    return;
  }

  try {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = over(socket);

    // Disable debug logging from STOMP
    stompClient.debug = () => {};

    stompClient.connect(
      {},
      () => {
        stompClient?.subscribe(
          `/topic/notifications/${userId}`,
          (message: { body: string }) => {
            if (message.body) {
              onNotification(JSON.parse(message.body));
            }
          }
        );
        console.log('Connected to notification socket');
      },
      (error: string | Frame) => {
        console.error('WebSocket connection error:', error);
      }
    );
  } catch (error) {
    console.error('Failed to initialize WebSocket connection:', error);
  }
}

export function disconnectNotificationSocket() {
  if (stompClient) {
    try {
      stompClient.disconnect(() => {
        console.log('WebSocket disconnected');
      });
      stompClient = null;
    } catch (error) {
      console.error('Error disconnecting WebSocket:', error);
    }
  }
}
