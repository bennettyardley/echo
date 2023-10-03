<template>
  <div>
    <div class="container flex">
      <div class="col my-auto"><p class="text-3xl">Top Artists</p></div>
      <div class="col ml-auto">
        <div class="dropdown dropdown-end">
          <select v-model="artistSelected" @change="artistChange" class="select focus:outline-none">
            <option selected value="allTime">All Time</option>
            <option value="lastYear">Last Year</option>
            <option value="lastDecade">Last Decade</option>
          </select>
        </div>
      </div>
    </div>
    <div class="grid grid-rows-2 grid-cols-4 gap-2 pt-8">
      <div
        @click="toArtist(artists[0].artist)"
        class="col-span-2 row-span-2 aspect-square overflow-hidden relative rounded-3xl hover:cursor-pointer">
        <img class="object-cover w-full h-full opacity-60" :src="artists[0].media" />
        <figcaption class="absolute px-7 text-center text-lg text-white top-5 hover:underline">{{ artists[0].artist }}</figcaption>
        <figcaption class="absolute px-7 text-center text-sm text-white top-12">{{ artists[0].count }} Times</figcaption>
      </div>
      <div
        v-for="i of [...Array(4).keys()]"
        :key="i"
        @click="toArtist(artists[i + 1].artist)"
        class="aspect-square overflow-hidden relative rounded-3xl hover:cursor-pointer">
        <img class="object-cover w-full h-full opacity-60" :src="artists[i + 1].media" />
        <figcaption class="absolute px-4 text-center text-sm text-white top-5 hover:underline">{{ artists[i + 1].artist }}</figcaption>
        <figcaption class="absolute px-4 text-center text-xs text-white top-10">{{ artists[i + 1].count }} Times</figcaption>
      </div>
    </div>
    <div class="container flex mt-6">
      <div class="col my-auto"><p class="text-3xl">Top Venues</p></div>
      <div class="col ml-auto">
        <select v-model="venueSelected" @change="venueChange" class="select focus:outline-none">
          <option selected value="allTime">All Time</option>
          <option value="lastYear">Last Year</option>
          <option value="lastDecade">Last Decade</option>
        </select>
      </div>
    </div>
    <div class="grid grid-rows-2 grid-cols-4 gap-2 pt-8">
      <div
        @click="toVenue(venues[0].venue)"
        class="col-span-2 row-span-2 aspect-square overflow-hidden relative rounded-3xl hover:cursor-pointer">
        <img class="object-cover w-full h-full opacity-60" :src="venues[0].media" />
        <figcaption class="absolute px-7 text-center text-lg text-white top-5 hover:underline">{{ venues[0].venue }}</figcaption>
        <figcaption class="absolute px-7 text-center text-sm text-white top-12">{{ venues[0].count }} Times</figcaption>
      </div>

      <div
        v-for="i of [...Array(4).keys()]"
        :key="i"
        @click="toVenue(venues[i + 1].venue)"
        class="aspect-square overflow-hidden relative rounded-3xl hover:cursor-pointer">
        <img class="object-cover w-full h-full opacity-60" :src="venues[i + 1].media" />
        <figcaption class="absolute px-4 text-center text-sm text-white top-5 hover:underline">
          {{ venues[i + 1].venue }}
        </figcaption>
        <figcaption class="absolute px-4 text-center text-xs text-white top-10">{{ venues[i + 1].count }} Times</figcaption>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  const defaultArtistImg = new URL('../assets/missingArtist.png', import.meta.url)
  const defaultImg = new URL('../assets/missingVenue.jpg', import.meta.url)

  export default {
    name: 'Artists',
    data() {
      return {
        artists: Array(5).fill({}),
        venues: Array(5).fill({}),
        rangeArtist: ['allTime', 'lastYear', 'lastDecade'],
        rangeVenue: ['allTime', 'lastYear', 'lastDecade'],
        venueSelected: 'allTime',
        artistSelected: 'allTime',
        url: import.meta.env.VITE_API,
      }
    },
    methods: {
      toArtist(name) {
        this.$router.push('/artist/' + name)
      },
      toVenue(name) {
        this.$router.push('/venue/' + name)
      },
      async artistChange() {
        const response = await axios.get(import.meta.env.VITE_API + '/top/' + this.artistSelected)

        for (let i of [...Array(5).keys()]) {
          if (response.data.artists[i]) {
            let artist = response.data.artists[i]
            this.artists[i] = {
              artist: artist.artist,
              count: artist.count,
              media: artist.media === '' ? defaultArtistImg : this.url + '/image/' + artist.media,
            }
          } else {
            this.artists[i] = {
              artist: 'None Yet',
              count: 0,
              media: defaultArtistImg,
            }
          }
        }
      },
      async venueChange() {
        const response = await axios.get(import.meta.env.VITE_API + '/top/' + this.venueSelected)

        for (let i of [...Array(5).keys()]) {
          if (response.data.venues[i]) {
            let venue = response.data.venues[i]
            this.venues[i] = {
              venue: venue.venue,
              count: venue.count,
              media: venue.media === '' ? defaultImg : this.url + '/image/' + venue.media,
            }
          } else {
            this.venues[i] = {
              venue: 'None Yet',
              count: 0,
              media: defaultImg,
            }
          }
        }
      },
    },
    async beforeMount() {
      const response = await axios.get(import.meta.env.VITE_API + '/top/allTime')

      for (let i of [...Array(5).keys()]) {
        if (response.data.artists[i]) {
          let artist = response.data.artists[i]
          this.artists[i] = {
            artist: artist.artist,
            count: artist.count,
            media: artist.media === '' ? defaultArtistImg : this.url + '/image/' + artist.media,
          }
        } else {
          this.artists[i] = {
            venue: 'None Yet',
            count: 0,
            media: defaultArtistImg,
          }
        }

        if (response.data.venues[i]) {
          let venue = response.data.venues[i]
          this.venues[i] = {
            venue: venue.venue,
            count: venue.count,
            media: venue.media === '' ? defaultImg : this.url + '/image/' + venue.media,
          }
        } else {
          this.venues[i] = {
            venue: 'None Yet',
            count: 0,
            media: defaultImg,
          }
        }
      }
    },
  }
</script>

<style></style>
