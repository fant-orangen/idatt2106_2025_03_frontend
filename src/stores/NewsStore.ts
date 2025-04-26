import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNewsStore = defineStore('newsStore', () => {
  // News state
  const news = ref([
    { id: 1, title: 'Fire', time: '10:34', message: 'Fire in Trondheim', position: 'Trondheim', read: false },
    { id: 2, title: 'Flood', time: '11:00', message: 'Flood warning in Oslo', position: 'Oslo', read: true },
    { id: 3, title: 'Earthquake', time: '12:15', message: 'Earthquake in Bergen', position: 'Bergen', read: false },
    { id: 4, title: 'Storm', time: '13:45', message: 'Storm warning in Stavanger', position: 'Stavanger', read: false },
    { id: 5, title: 'Road closure', time: '14:30', message: 'Road closure in Prinsenkrysset', position: 'Trondheim', read: true },
    { id: 6, title: 'Power outage', time: '14:33', message: 'Power outage at Gløshaugen', position: 'Trondheim', read: true },
  ])

  // Getter for top 3 news
  const topNews = () => news.value.slice(0, 3)

  // Getter for top 3 news by position
  const topNewsByPosition = (position: string) => {
    return news.value.filter((item) => item.position === position).slice(0, 3)
  }

  // Action to fetch news (simulated API call)
  const fetchNews = async () => {
    // Simulate an API call with a delay
    const simulatedApiResponse = [
      { id: 7, title: 'Heatwave', time: '15:00', message: 'Heatwave warning in Tromsø', position: 'Tromsø', read: false },
      { id: 8, title: 'Snowstorm', time: '16:00', message: 'Snowstorm expected in Trondheim', position: 'Trondheim', read: false },
    ]

    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update the news state
    news.value = [...news.value, ...simulatedApiResponse]
  }

  return {
    news,
    topNews,
    topNewsByPosition,
    fetchNews,
  }
})