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
          <Share :artists="artists" :venue="venue" :date="entryDate" :media="media" />
        </div>
        <div class="mt-5">
          <label for="deleteModal" class="btn btn-error">Delete</label>
        </div>
      </div>

      <!-- Upload -->
      <div class="w-full mt-5 mb-20">
        <Upload :id="id" :artists="artists" @addedMedia="newMedia" />
        <div class="flex space-x-2 overflow-x-auto mt-2">
          <div v-for="img in media" :key="img" class="relative group">
            <div class="relative inline-block group-hover">
              <img :src="url + '/image/' + img" class="max-w-xs max-h-xs bg-100 rounded" />
              <button
                @click="deleteImage(img)"
                class="absolute top-2 right-2 p-1 btn btn-error btn-circle opacity-0 transition-opacity group-hover:opacity-100 focus:outline-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-trash3-fill"
                  viewBox="0 0 16 16">
                  <path
                    d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Modal -->
      <input type="checkbox" v-model="deleteOpen" id="deleteModal" class="modal-toggle" />
      <div class="modal">
        <div class="modal-box flex flex-col justify-between max-w-none w-1/5 h-1/4">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeDeleteModal">✕</button>
          <div>
            <p class="text-center mt-2">Are you sure you want to delete?</p>
          </div>
          <div class="flex justify-between mt-4">
            <button class="btn btn-outline" @click="closeDeleteModal">No</button>
            <button class="btn btn-error" @click="deleteEntry">Yes</button>
          </div>
        </div>
        <label class="modal-backdrop" for="deleteModal">Close</label>
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
        url: import.meta.env.VITE_API,
        rate: { 1: false, 2: false, 3: false, 4: false, 5: false },
        id: this.$route.params.id,
        first: true,
        second: true,
        deleteOpen: false,
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
      this.media = response.data.media
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
        this.deleteOpen = false
        this.$router.push('/')
      },
      newMedia(value) {
        if (this.media) {
          if (!this.media.includes(value)) this.media.push(value)
        } else this.media = [value]
      },
      async deleteImage(name) {
        await axios
          .patch(import.meta.env.VITE_API + '/media', { id: this.id, media: name, artists: this.artists })
          .then((res) => {})
          .catch((err) => {
            console.log(err)
          })
        this.media = this.media.filter((item) => item !== name)
      },
      closeDeleteModal() {
        this.deleteOpen = false
      },
    },
  }
</script>

<style></style>
