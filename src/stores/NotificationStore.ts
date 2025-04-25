import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notificationStore', () => {
  // Notifications state
  const notifications = ref([
    { id: 1, message: 'New message from John Doe', read: false },
    { id: 2, message: 'Your order has been shipped', read: true },
    { id: 3, message: 'New comment on your post', read: false },
    { id: 4, message: 'System maintenance scheduled for tonight', read: false },
    { id: 5, message: 'New feature update available', read: true },
    { id: 6, message: 'Password change successful', read: false },
    { id: 7, message: 'New friend request from Jane Doe', read: true },
    { id: 8, message: 'Your profile has been updated', read: false },
    { id: 9, message: 'New event invitation received', read: true },
    { id: 10, message: 'System alert: High CPU usage detected', read: false },
  ])

  // Getter for top 3 notifications
  const topNotifications = () => notifications.value.slice(0, 3)

  return {
    notifications,
    topNotifications,
  }
})