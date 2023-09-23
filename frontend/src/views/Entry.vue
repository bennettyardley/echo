<template>
  <div>
    <Navbar />
    <v-select multiple taggable push-tags :options="allArtists" v-model="artists" class="outline outline-secondary rounded"></v-select>
    <v-select taggable push-tags :options="allVenues" v-model="venue" class="outline outline-secondary rounded"></v-select>
    <VueDatePicker :enable-time-picker="false" position="center" v-model="entryDate" dark class="outline outline-secondary rounded" />
    <textarea class="textarea" placeholder="Comments"></textarea>
    <form action="localhost:4202/api/upload" method="post" enctype="multipart/form-data">
      <input type="file" class="file-input w-full max-w-xs" />
      <input type="submit" class="btn" />
    </form>
    <div class="rating gap-1">
      <input type="radio" name="rating-3" class="mask mask-star-2 bg-red-400" />
      <input type="radio" name="rating-3" class="mask mask-star-2 bg-orange-400" checked />
      <input type="radio" name="rating-3" class="mask mask-star-2 bg-yellow-400" />
      <input type="radio" name="rating-3" class="mask mask-star-2 bg-lime-400" />
      <input type="radio" name="rating-3" class="mask mask-star-2 bg-green-400" />
    </div>
    Favorite Share
  </div>
</template>

<script>
  import Navbar from '../components/Navbar.vue'

  export default {
    components: {
      Navbar,
    },
  }
</script>

<style></style>
