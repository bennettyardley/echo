<template>
  <div class="container flex">
    <div class="mx-auto">
      <div class="stats bg-accent text-primary-content">
        <div class="stat">
          <div class="stat-title text-primary-content">Concerts This Year</div>
          <div class="stat-value">{{ year.num }}</div>
          <div class="stat-desc text-primary-content">{{ year.pct }}</div>
        </div>
      </div>
      <div class="stats bg-primary text-primary-content">
        <div class="stat">
          <div class="stat-title text-primary-content">Unique Artists</div>
          <div class="stat-value">{{ unique.num }}</div>
          <div class="stat-desc text-primary-content">{{ unique.pct }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'Stats',
    data() {
      return {
        year: {},
        unique: {},
      }
    },
    async mounted() {
      const response = await axios.get('http://localhost:4202/stats')
      this.year = response.data.year
      this.unique = response.data.unique
    },
  }
</script>

<style></style>
