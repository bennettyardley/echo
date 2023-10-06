<template>
  <div>
    <Navbar />
    <div class="container mx-auto max-w-3xl">
      <Stats class="py-4" />
      <Entries class="py-4" />
      <Top class="py-4 mb-20" />
    </div>
  </div>
</template>

<script>
  import Navbar from '../components/Navbar.vue'
  import Entries from '../components/Entries.vue'
  import Stats from '../components/Stats.vue'
  import Top from '../components/Top.vue'
  import { keyStore } from '../stores/key'

  export default {
    setup() {
      const key = keyStore()

      return { key }
    },
    async beforeMount() {
      if (this.key.apiKey === '') await this.key.refresh()
    },
    components: {
      Navbar,
      Entries,
      Stats,
      Top,
    },
  }
</script>

<style></style>
