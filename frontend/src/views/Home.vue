<template>
  <div>
    <Navbar />
    <div class="container mx-auto max-w-3xl">
      <Stats class="py-4" />
      <Entries class="py-4" />
      <Artists class="py-4" />
    </div>
  </div>
</template>

<script>
  import Navbar from '../components/Navbar.vue'
  import Entries from '../components/Entries.vue'
  import Stats from '../components/Stats.vue'
  import Artists from '../components/Artists.vue'

  export default {
    components: {
      Navbar,
      Entries,
      Stats,
      Artists,
    },
  }
</script>

<style></style>
