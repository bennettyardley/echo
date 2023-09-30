<template>
  <div>
    <!-- Navbar Component -->
    <Navbar />
    <div class="container mx-auto flex flex-col items-center justify-center w-6/12">
      <!-- Artists -->
      <div class="w-full mt-5">
        <v-select
          multiple
          taggable
          :options="form.allArtists"
          v-model="artists"
          @change="updateArtists"
          class="p-1 outline rounded outline-secondary"></v-select>
      </div>

      <!-- Venue -->
      <div class="w-full mt-5 flex justify-between items-center">
        <span class="text-lg">Venue:</span>
        <v-select
          taggable
          :options="form.allVenues"
          v-model="venue"
          @change="updateVenues"
          class="outline rounded outline-secondary w-9/12"></v-select>
      </div>

      <!-- Date Picker -->
      <div class="w-full mt-5 flex justify-between items-center">
        <span class="text-lg">Date:</span>
        <VueDatePicker
          :enable-time-picker="false"
          position="center"
          v-model="entryDate"
          dark
          class="outline rounded outline-secondary w-9/12" />
      </div>

      <!-- Rating and Favorite -->
      <div class="w-full mt-5 flex justify-between items-center">
        <div class="rating gap-1">
          <input type="radio" id="1" name="rating" class="mask mask-star-2 bg-red-400" :checked="rate[1]" />
          <input type="radio" id="2" name="rating" class="mask mask-star-2 bg-orange-400" :checked="rate[2]" />
          <input type="radio" id="3" name="rating" class="mask mask-star-2 bg-yellow-400" :checked="rate[3]" />
          <input type="radio" id="4" name="rating" class="mask mask-star-2 bg-lime-400" :checked="rate[4]" />
          <input type="radio" id="5" name="rating" class="mask mask-star-2 bg-green-400" :checked="rate[5]" />
        </div>
        <label class="swap swap-rotate">
          <input type="checkbox" v-model="favorite" @change="updateFavorite" />
          <div class="swap-off text-4xl">🤍</div>
          <div class="swap-on text-4xl">❤️</div>
        </label>
      </div>

      <!-- Comment Textarea -->
      <textarea
        class="w-full p-2 mt-5 h-60 outline rounded outline-secondary bg-base-100"
        v-model="comment"
        placeholder="Comments"></textarea>

      <!-- Share and Delete -->
      <div class="w-full mt-5 flex justify-between items-center">
        <div class="mt-5">
          <Share class="" />
        </div>
        <div class="mt-5">
          <button @click="deleteEntry" class="btn btn-error">Delete</button>
        </div>
      </div>

      <!-- Upload -->
      <div class="w-full mt-5">
        <Upload class="w-full" />
      </div>
    </div>
  </div>
</template>

<script>
  import Navbar from '../components/Navbar.vue'
  import Upload from '../components/Upload.vue'
  import Share from '../components/Share.vue'
  import { formStore } from '../stores/form'

  import axios from 'axios'
  import _debounce from 'lodash/debounce'

  export default {
    setup() {
      const form = formStore()

      return { form }
    },
    components: {
      Navbar,
      Upload,
      Share,
    },
    data() {
      return {
        artists: [],
        venue: '',
        entryDate: null,
        favorite: false,
        comment: '',
        rating: 1,
        media: [],
        rate: { 1: false, 2: false, 3: false, 4: false, 5: false },
        id: this.$route.params.id,
        first: true,
        second: true,
      }
    },
    watch: {
      comment: function (value) {
        this.updateComment(value)
      },
      artists: function () {
        this.updateOther()
      },
      venue: function () {
        this.updateOther()
      },
      entryDate: function () {
        this.updateOther()
      },
    },
    async beforeMount() {
      const response = await axios.get(import.meta.env.VITE_API + '/entry/' + this.id)
      this.artists = response.data.artists
      this.entryDate = response.data.date
      this.venue = response.data.venue
      this.favorite = response.data.favorite
      this.comment = response.data.comment
      this.rate[response.data.rating] = true
    },
    methods: {
      updateComment: _debounce(function (value) {
        if (this.second) {
          this.second = false
          return
        }
        axios
          .patch(import.meta.env.VITE_API + '/entry', { id: this.id, comment: value })
          .then((res) => {})
          .catch((err) => {
            console.log(err)
          })
      }, 1500),
      updateOther: _debounce(function () {
        if (this.first) {
          this.first = false
          return
        }
        axios
          .patch(import.meta.env.VITE_API + '/entry', { id: this.id, artists: this.artists, venue: this.venue, date: this.entryDate })
          .then((res) => {})
          .catch((err) => {
            console.log(err)
          })
      }, 500),
      updateRating(field) {
        axios
          .patch(import.meta.env.VITE_API + '/entry', { id: this.id, rating: field.target.id })
          .then((res) => {})
          .catch((err) => {
            console.log(err)
          })
      },
      updateFavorite() {
        axios
          .patch(import.meta.env.VITE_API + '/entry', { id: this.id, favorite: this.favorite })
          .then((res) => {})
          .catch((err) => {
            console.log(err)
          })
      },
      updateArtists() {
        if (typeof this.artists.slice(-1)[0] === 'string') {
          this.form.addArtist(this.artists.slice(-1)[0])
        } else {
          this.form.addArtist(this.artists.slice(-1)[0].label)
        }
      },
      updateVenues() {
        this.form.addVenue(this.venue)
      },
      async deleteEntry() {
        await axios.delete(import.meta.env.VITE_API + '/entry/' + this.id)
        this.$router.push('/')
      },
    },
  }
</script>

<style></style>
