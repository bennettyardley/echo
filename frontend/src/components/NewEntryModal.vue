<template>
  <div>
    <label for="entryModal" class="btn btn-ghost btn-circle">+</label>
    <input type="checkbox" v-model="open" id="entryModal" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box flex max-w-none w-3/5 h-3/4 justify-center">
        <form method="dialog" class="text-center w-3/5">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeModal">✕</button>
          <p v-if="newError !== ''" class="">{{ this.newError }}</p>
          <h3 class="font-bold text-xl mt-5">Had Fun? Log your concert:</h3>
          <div class="mt-5">
            <v-select
              multiple
              taggable
              :options="form.allArtists"
              v-model="newArtists"
              @change="updateArtistsNew"
              placeholder="Who'd You See?"
              class="outline outline-secondary rounded"></v-select>
          </div>
          <div class="mt-5">
            <v-select
              taggable
              :options="form.allVenues"
              v-model="newVenue"
              @change="updateVenuesNew"
              placeholder="Where'd You Go?"
              class="outline outline-secondary rounded"></v-select>
          </div>
          <div class="mt-5">
            <VueDatePicker
              :enable-time-picker="false"
              position="center"
              v-model="newEntryDate"
              class="outline outline-secondary rounded"
              dark />
          </div>
          <div class="absolute inset-x-0 bottom-5">
            <button class="btn btn-primary" @click="submit">ADD New Entry</button>
          </div>
        </form>
      </div>
      <label class="modal-backdrop" for="entryModal">Close</label>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import { formStore } from '../stores/form'

  export default {
    setup() {
      const form = formStore()

      return { form }
    },
    name: 'NewEntryModal',
    data() {
      return {
        newArtists: [],
        newVenue: '',
        newEntryDate: new Date(),
        open: false,
        newError: '',
      }
    },
    async beforeMount() {
      if (this.form.allArtists.length === 0 || this.form.allVenues.length === 0) await this.form.refresh()
    },
    methods: {
      closeModal() {
        this.open = false
      },
      async submit() {
        this.newError = ''
        if (this.newArtists.length === 0) {
          this.newError = 'At least one artist is required'
          return
        } else if (this.newVenue === '' || this.newVenue === null) {
          this.newError = 'Enter a venue'
          return
        } else if (this.newEntryDate === null) {
          this.newError = 'Enter a date'
          return
        }
        const response = await axios.post(import.meta.env.VITE_API + '/entry', {
          artists: this.newArtists,
          venue: this.newVenue,
          date: this.newEntryDate,
        })
        this.$router.push('/entry/' + response.data.id)
        this.open = false
      },
      updateArtistsNew() {
        this.form.addArtist(this.newArtists.slice(-1)[0])
      },
      updateVenuesNew() {
        this.form.addVenue(this.newVenue)
      },
    },
  }
</script>

<style>
  * {
    --vs-controls-color: #e9e5ff;

    --vs-dropdown-bg: #302f3d;
    --vs-dropdown-color: #e9e5ff;
    --vs-dropdown-option-color: #e9e5ff;

    --vs-selected-bg: #e679c0;
    --vs-selected-color: #e9e5ff;
  }
  .dp__theme_dark {
    --dp-background-color: #302f3d;
    --dp-text-color: #e9e5ff;
    --dp-hover-color: #e679c0;
    --dp-hover-text-color: #302f3d;
    --dp-hover-icon-color: #e9e5ff;
    --dp-primary-color: #e679c0;
    --dp-primary-text-color: #ffffff;
    --dp-secondary-color: #a9a9a9;
    --dp-border-color: #2d2d2d;
    --dp-menu-border-color: #2d2d2d;
    --dp-border-color-hover: #e679c0;
    --dp-disabled-color: #737373;
    --dp-scroll-bar-background: #212121;
    --dp-scroll-bar-color: #484848;
    --dp-success-color: #00701a;
    --dp-success-color-disabled: #428f59;
    --dp-icon-color: #e9e5ff;
    --dp-danger-color: #e53935;
    --dp-highlight-color: rgba(0, 92, 178, 0.2);
  }
</style>
