<template>
    <div>
      <button class="btn btn-ghost btn-circle" @click="openModal">+</button>
      <dialog id="my_modal_3" class="modal">
        <div class="modal-box">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeModal">✕</button>
          </form>
          <h3 class="font-bold text-xl">Hello!</h3>
          <p class="py-4">Press ESC key or click on ✕ button to close</p>
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