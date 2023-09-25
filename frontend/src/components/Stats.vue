<template>
  <div class="container flex">
    <div class="mx-auto">
      <div class="stats bg-accent text-primary-content">
        <div class="stat">
          <div class="stat-title text-primary-content">Concerts This Year</div>
          <div class="stat-value">13</div>
          <div class="stat-desc text-primary-content">21% more than last year</div>
        </div>
      </div>
      <div class="stats bg-primary text-primary-content">
        <div class="stat">
          <div class="stat-title text-primary-content">Unique Artists</div>
          <div class="stat-value">11</div>
          <div class="stat-desc text-primary-content">5% more than last year</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'Stats',
    async beforeMount() {
      const response = await axios.get('http://localhost:4202/stats')
      console.log(response.data)
    },
  }
</script>

<style></style>
