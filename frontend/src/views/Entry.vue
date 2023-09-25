<template>
  <div>
    <Navbar />
    <label class="swap swap-rotate mx-auto">
      <input type="checkbox" v-model="favorite" @change="updateFavorite" />
      <div class="swap-off">🤍</div>
      <div class="swap-on">❤️</div>
    </label>
    <v-select
      multiple
      taggable
      :options="form.allArtists"
      v-model="artists"
      @change="updateArtists"
      class="outline outline-secondary rounded"></v-select>
    <v-select
      taggable
      :options="form.allVenues"
      v-model="venue"
      @change="updateVenues"
      class="outline outline-secondary rounded"></v-select>
    <VueDatePicker :enable-time-picker="false" position="center" v-model="entryDate" dark class="outline outline-secondary rounded" />
    <textarea class="textarea" v-model="comment" placeholder="Comments"></textarea>
    <div class="rating gap-1" @change="updateRating">
      <input type="radio" id="1" name="rating" class="mask mask-star-2 bg-red-400" :checked="rate[1]" />
      <input type="radio" id="2" name="rating" class="mask mask-star-2 bg-orange-400" :checked="rate[2]" />
      <input type="radio" id="3" name="rating" class="mask mask-star-2 bg-yellow-400" :checked="rate[3]" />
      <input type="radio" id="4" name="rating" class="mask mask-star-2 bg-lime-400" :checked="rate[4]" />
      <input type="radio" id="5" name="rating" class="mask mask-star-2 bg-green-400" :checked="rate[5]" />
    </div>
    <Share />
    <Upload />
    <button @click="deleteEntry" class="btn btn-error">Delete</button>
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
      const response = await axios.get('http://localhost:4202/entry/' + this.id)
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
          .patch('http://localhost:4202/entry', { id: this.id, comment: value })
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
          .patch('http://localhost:4202/entry', { id: this.id, artists: this.artists, venue: this.venue, date: this.entryDate })
          .then((res) => {})
          .catch((err) => {
            console.log(err)
          })
      }, 500),
      updateRating(field) {
        axios
          .patch('http://localhost:4202/entry', { id: this.id, rating: field.target.id })
          .then((res) => {})
          .catch((err) => {
            console.log(err)
          })
      },
      updateFavorite() {
        axios
          .patch('http://localhost:4202/entry', { id: this.id, favorite: this.favorite })
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
        await axios.delete('http://localhost:4202/entry/' + this.id)
        this.$router.push('/')
      },
    },
  }
</script>

<style></style>
