import { defineStore } from 'pinia'
import axios from 'axios'

export const formStore = defineStore('form', {
  state: () => ({
    allArtists: JSON.parse(localStorage.getItem('allArtists')) || [],
    allVenues: JSON.parse(localStorage.getItem('allVenues')) || [],
  }),
  actions: {
    async refresh() {
      const response = await axios.get('http://localhost:4202/formData')
      this.allArtists = response.data.artists
      localStorage.setItem('allArtists', JSON.stringify(response.data.artists))
      this.allVenues = response.data.venues
      localStorage.setItem('allVenues', JSON.stringify(response.data.venues))
    },
  },
})
