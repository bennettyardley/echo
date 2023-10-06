<template>
  <div class="container flex flex-col sm:flex-row gap-4">
    <div class="mx-auto flex-row sm:flex-col stats bg-accent text-primary-content max-w-min">
      <div class="stat place-items-center">
        <div class="stat-title text-primary-content">Concerts</div>
        <div class="stat-value">{{ concertStats.total }}</div>
        <div class="stat-desc text-secondary"></div>
      </div>

      <div class="stat place-items-center text-primary-content">
        <div class="stat-title text-primary-content">This Year</div>
        <div class="stat-value">{{ concertStats.year }}</div>
        <div class="stat-desc text-primary-content">{{ concertStats.yearText }}</div>
      </div>
    </div>
    <div class="mx-auto flex-row sm:flex-col stats bg-primary text-primary-content max-w-min">
      <div class="stat place-items-center">
        <div class="stat-title text-primary-content">Artists</div>
        <div class="stat-value">{{ artistStats.total }}</div>
        <div class="stat-desc text-secondary"></div>
      </div>

      <div class="stat place-items-center text-primary-content">
        <div class="stat-title text-primary-content">This Year</div>
        <div class="stat-value">{{ artistStats.year }}</div>
        <div class="stat-desc text-primary-content">{{ artistStats.yearText }}</div>
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
        concertStats: {},
        artistStats: {},
      }
    },
    async beforeMount() {
      const response = await axios.get(import.meta.env.VITE_API + '/stats')
      const concertRes = response.data.concerts
      const artistRes = response.data.artists
      let arrow = '-'
      if (concertRes.changeType === 'increase') arrow = '↗︎'
      else if (concertRes.changeType === 'decrease') arrow = '↘︎'

      this.concertStats = {
        total: concertRes.total,
        year: concertRes.num,
        yearText: arrow + ' (' + concertRes.change + ') ' + concertRes.pct + '%',
      }

      let arrow2 = '-'
      if (artistRes.changeType === 'increase') arrow2 = '↗︎'
      else if (artistRes.changeType === 'decrease') arrow2 = '↘︎'

      this.artistStats = {
        total: artistRes.total,
        year: artistRes.num,
        yearText: arrow2 + ' (' + artistRes.change + ') ' + artistRes.pct + '%',
      }
    },
  }
</script>

<style></style>
