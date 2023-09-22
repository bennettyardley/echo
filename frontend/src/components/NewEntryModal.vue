<template>
    <div>
      <button class="btn btn-ghost btn-circle" @click="openModal">+</button>
      <dialog id="my_modal_3" class="modal">
        <div class="modal-box">
          <form method="dialog" class="content-center">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeModal">✕</button>
            <h3 class="font-bold text-xl">Hello!</h3>
            <p class="py-4">A Curse upon Your Bloodline</p>
            <VueDatePicker :enable-time-picker="false" :max-date="new Date()" dark />
            <v-select multiple taggable push-tags :options="allArtists" v-model="artists" class="text-primary-content rounded">Search or add an Artist</v-select>
            <v-select taggable push-tags :options="allVenues" class="text-primary-content rounded">Search or add an Venue</v-select>
            <button class="btn btn-primary mt-4 " @click="closeModal">ADD New Entry</button>
          </form>
        </div>
      </dialog>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NewEntryModal',
    methods: {
      openModal() {
        const modal = document.getElementById('my_modal_3');
        modal.showModal();
      },
      closeModal() {
        const modal = document.getElementById('my_modal_3');
        modal.close();
      },
    },
  };
  </script>
  
  <style> </style>
  