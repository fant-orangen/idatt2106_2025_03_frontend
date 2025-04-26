import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notificationStore', () => {
  // Notifications state -- for now, this is just a mockup
  const notifications = ref([
    { id: 1, time: '12:44', message: 'New message from John Doe', read: false },
    { id: 2, time: '12:22', message: 'Your order has been shipped', read: true },
    { id: 3, time: '13:21', message: 'New comment on your post', read: false },
    { id: 4, time: '13:04', message: 'System maintenance scheduled for tonight', read: false },
    { id: 5, time: '05:16', message: 'New feature update available', read: true },
    { id: 6, time: '10:34', message: 'Password change successful', read: false },
    { id: 7, time: '12:34', message: 'New friend request from Jane Doe', read: true },
    { id: 8, time: '21:43', message: 'Your profile has been updated', read: false },
    { id: 9, time: '23:03', message: 'New event invitation received', read: true },
  ])

  // Getter for top 3 notifications
  const topNotifications = () => notifications.value.slice(0, 3)

  return {
    notifications,
    topNotifications,
  }
})