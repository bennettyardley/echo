import { defineStore } from 'pinia'
import axios from 'axios'

export const keyStore = defineStore('key', {
  state: () => ({
    apiKey: localStorage.getItem('apiKey') || '',
  }),
  actions: {
    async refresh() {
      const response = await axios.get(import.meta.env.VITE_API + '/key')
      this.apiKey = response.data.key
      localStorage.setItem('apiKey', this.apiKey)
    },
  },
})
