<template>
    <div>
      <button class="btn btn-ghost btn-circle" @click="openModal">+</button>
      <dialog id="my_modal_3" class="modal">
        <div class="modal-box flex flex-col items-center justify-center min-h-[50vh] max-h-[80vh]">
          <form method="dialog" class="text-center">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeModal">✕</button>
            <h3 class="font-bold text-xl">Hello!</h3>
            <p class="py-4">A Curse upon Your Bloodline</p>
            <div class="mb-4">
              <VueDatePicker :enable-time-picker="false" :max-date="new Date()" class="bg-primary rounded" dark />
            </div>
              <div class="mb-4">
              <v-select multiple taggable push-tags :options="allArtists" v-model="artists" class="bg-primary rounded">Search or add an Artist</v-select>
            </div>
            <div class="mb-4">
              <v-select taggable push-tags :options="allVenues" class="bg-primary rounded">Search or add a Venue</v-select>
            </div>            
            <button class="btn btn-primary mt-4" @click="closeModal">ADD New Entry</button>
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
  