import { defineStore } from 'pinia'
import axios from 'axios'

export const formStore = defineStore('form', {
  state: () => ({
    allArtists: JSON.parse(localStorage.getItem('allArtists')) || [],
    allVenues: JSON.parse(localStorage.getItem('allVenues')) || [],
    allGenres: JSON.parse(localStorage.getItem('allGenres')) || [],
  }),
  actions: {
    async refresh() {
      const response = await axios.get(import.meta.env.VITE_API + '/formData')
      this.allArtists = response.data.artists
      localStorage.setItem('allArtists', JSON.stringify(response.data.artists))
      this.allVenues = response.data.venues
      localStorage.setItem('allVenues', JSON.stringify(response.data.venues))
      this.allGenres = response.data.genres
      localStorage.setItem('allGenres', JSON.stringify(response.data.genres))
    },
    addArtist(artist) {
      if (!this.allArtists.includes(artist) && artist !== null && artist !== undefined && artist !== '') {
        this.allArtists.push(artist)
        localStorage.setItem('allArtists', JSON.stringify(this.allArtists))
      }
    },
    addVenue(venue) {
      if (!this.allVenues.includes(venue) && venue !== null && venue !== undefined && venue !== '') {
        this.allVenues.push(venue)
        localStorage.setItem('allVenues', JSON.stringify(this.allVenues))
      }
    },
    addGenre(genre) {
      if (!this.allGenres.includes(genre) && genre !== null && genre !== undefined && genre !== '') {
        this.allGenres.push(genre)
        localStorage.setItem('allGenres', JSON.stringify(this.allGenres))
      }
    },
  },
})
