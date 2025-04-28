import SockJS from 'sockjs-client';
import { Client, over, Frame } from 'stompjs';
import type { NotificationMessage } from '@/models/NotificationMessage.ts';

// Ensure global is defined for SockJS
if (typeof window !== 'undefined') {
  (window as Window & typeof globalThis).global = window;
}

let stompClient: Client | null = null;

export function connectNotificationSocket(userId: string | number, onNotification: (msg: NotificationMessage) => void) {
  if (!userId) {
    console.warn('No user ID provided, cannot connect to notification socket');
    return;
  }

  // Convert userId to string for consistency
  const userIdStr = userId.toString();

  // If already connected, disconnect first
  if (stompClient?.connected) {
    console.log('Already connected to WebSocket, disconnecting first...');
    disconnectNotificationSocket();
  }

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
      {},
      () => {
        const topic = `/topic/notifications/${userIdStr}`;
        console.log('WebSocket connected, subscribing to topic:', topic);

        if (!stompClient) {
          console.error('Stomp client is null after connection');
          return;
        }

        stompClient.subscribe(
          topic,
          (message: { body: string }) => {
            console.log('Received raw message:', message);
            if (message.body) {
              try {
                const notification = JSON.parse(message.body) as NotificationMessage;
                console.log('Parsed notification:', notification);
                onNotification(notification);
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
      },
      (error: string | Frame) => {
        console.error('WebSocket connection error:', error);
        if (error instanceof Frame) {
          console.error('Frame details:', {
            command: error.command,
            headers: error.headers,
            body: error.body
          });
        }
      }
    );
  } catch (error) {
    console.error('Failed to initialize WebSocket connection:', error);
  }
}

export function disconnectNotificationSocket() {
  if (stompClient) {
    try {
      console.log('Disconnecting WebSocket...');
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
}
