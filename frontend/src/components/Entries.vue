<template>
  <div>
    <input type="text" class="input input-bordered border-neutral mb-2" v-model="query" placeholder="🔍 Search" />
    <div class="card card-bordered overflow-hidden">
      <table v-if="table.length === 0" class="table">
        <tbody>
          <tr class="hover:bg-secondary hover:text-primary-content">
            <td>No Entries</td>
          </tr>
        </tbody>
      </table>
      <table v-else class="table">
        <tbody>
          <tr
            v-for="entry in table"
            :key="entry.id"
            @click="peek($event, 'entry', entry.id)"
            class="hover:bg-secondary hover:text-primary-content">
            <th class="px-3">
              <div class="flex">
                <label class="swap swap-rotate mx-auto">
                  <input type="checkbox" :checked="entry.favorite" @change="updateFavorite($event)" :id="entry.id" />
                  <div class="swap-off">🤍</div>
                  <div class="swap-on">❤️</div>
                </label>
              </div>
            </th>
            <td class="pl-0">
              <div class="flex flex-wrap inline-block">
                <a
                  v-for="(artist, index) in entry.artists.split(', ')"
                  :key="artist"
                  @click="peek($event, 'artist', artist)"
                  class="link link-hover">
                  <p v-if="index === entry.artists.split(', ').length - 1">{{ artist }}</p>
                  <p v-else>{{ artist }},&nbsp;</p>
                </a>
              </div>
            </td>
            <td>
              <a @click="peek($event, 'venue', entry.venue)" class="link link-hover">{{ entry.venue }}</a>
            </td>
            <td class="text-right">{{ entry.date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="container flex">
      <div class="join ml-auto">
        <button
          v-for="n in pages"
          :key="n"
          class="join-item btn btn-outline border-transparent hover:bg-transparent hover:text-neutral-focus hover:border-transparent"
          :class="{ activate: n === page }"
          @click="pageTo(n)">
          {{ n }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import _debounce from 'lodash/debounce'

  export default {
    name: 'Entries',
    data() {
      return {
        table: [],
        page: 1,
        pages: 1,
        query: '',
      }
    },
    async beforeMount() {
      const response = await axios.get(import.meta.env.VITE_API + '/entries/1')
      this.table = response.data.entries
      this.pages = response.data.pages
    },
    watch: {
      query(val) {
        this.search(val)
      },
    },
    methods: {
      search: _debounce(async function (value) {
        if (this.query !== '') {
          this.page = 1
          const response = await axios.get(import.meta.env.VITE_API + '/search/' + this.query + '/1')
          this.table = response.data.entries
          this.pages = response.data.pages
        } else {
          const response = await axios.get(import.meta.env.VITE_API + '/entries/1')
          this.table = response.data.entries
          this.pages = response.data.pages
        }
      }, 500),
      peek(into, type, link) {
        if (into.target.nodeName && into.target.nodeName.toLowerCase() === 'td') this.$router.push('/entry/' + link)
        else if (into.target.nodeName && into.target.nodeName.toLowerCase() === 'div' && into.target.className !== 'swap-on')
          this.$router.push('/entry/' + link)
        else {
          if (type === 'artist') this.$router.push('/artist/' + link)
          else if (type === 'venue') this.$router.push('/venue/' + link)
        }
      },
      updateFavorite(event) {
        axios
          .patch(import.meta.env.VITE_API + '/entry', { id: event.target.id, favorite: event.target.checked })
          .then((res) => {})
          .catch((err) => {
            console.log(err)
          })
      },
      async pageTo(n) {
        if (n === this.page) return
        if (this.query === '') {
          const response = await axios.get(import.meta.env.VITE_API + '/entries/' + n)
          this.table = response.data.entries
          this.pages = response.data.pages
          this.page = n
        } else {
          const response = await axios.get(import.meta.env.VITE_API + '/search/' + this.query + '/' + n)
          this.table = response.data.entries
          this.pages = response.data.pages
          this.page = n
        }
      },
    },
  }
</script>

<style>
  .activate {
    color: #1b1c22;
  }
</style>
