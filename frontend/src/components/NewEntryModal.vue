<template>
  <div>
    <label for="entryModal" class="btn btn-ghost btn-circle">+</label>

    <input type="checkbox" v-model="open" id="entryModal" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box flex max-w-none w-3/5 h-3/4 justify-center">
        <form method="dialog" class="text-center w-3/5">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeModal">✕</button>
          <h3 class="font-bold text-xl mt-6">Had Fun? Log your concert:</h3>
          <div class="mt-6">
            <v-select
              multiple
              taggable
              push-tags
              :options="form.allArtists"
              v-model="newArtists"
              placeholder="Who'd You See?"
              class="outline outline-secondary rounded"></v-select>
          </div>
          <div class="mt-6">
            <v-select
              taggable
              push-tags
              :options="form.allVenues"
              v-model="newVenue"
              placeholder="Where'd You Go?"
              class="outline outline-secondary rounded"></v-select>
          </div>
          <div class="mt-6">
            <VueDatePicker
              :enable-time-picker="false"
              position="center"
              v-model="newEntryDate"
              class="outline outline-secondary rounded"
              dark />
          </div>
          <div class="mt-40">
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
    data: () => ({
      newArtists: [],
      newVenue: '',
      newEntryDate: new Date(),
      open: false,
    }),
    watch: {
      newArtists: async function () {
        await form.refresh()
      },
    },
    methods: {
      closeModal() {
        this.open = false
      },
      async submit() {
        const response = await axios.post('http://localhost:4202/entry', {
          artists: this.newArtists,
          venue: this.newVenue,
          date: this.newEntryDate,
        })
        this.$router.push('/entry/' + response.data.id)
        this.open = false
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
