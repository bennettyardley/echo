<template>
  <div>
    <div class="card card-bordered overflow-hidden">
      <table class="table">
        <tbody>
          <tr
            v-for="entry in table"
            :key="entry.id"
            @click="peek($event, 'entry', entry.id)"
            class="hover:bg-secondary hover:text-primary-content">
            <th class="px-0">
              <div class="flex">
                <label class="swap swap-rotate mx-auto">
                  <input type="checkbox" :checked="entry.favorite" @change="updateFavorite($event)" :id="entry.id" />
                  <div class="swap-off">🤍</div>
                  <div class="swap-on">❤️</div>
                </label>
              </div>
            </th>
            <td class="pl-2">
              <div class="flex">
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
          class="join-item btn btn-outline border-transparent hover:bg-transparent hover:text-primary-content hover:border-transparent">
          {{ n }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'Entries',
    data() {
      return {
        table: [],
        page: 1,
        pages: 3,
      }
    },
    async beforeMount() {
      const response = await axios.get('http://localhost:4202/entries/1')
      this.table = response.data.entries
      this.pages = response.data.pages
    },
    methods: {
      peek(into, type, link) {
        if (into.target.nodeName && into.target.nodeName.toLowerCase() === 'td') this.$router.push('/entry/' + link)
        else if (into.target.nodeName && into.target.nodeName.toLowerCase() === 'div' && into.target.className !== 'swap-on')
          this.$router.push('/entry/' + link)
        else {
          if (type === 'artist') console.log('Going to ' + type + ': ' + link)
          else if (type === 'venue') console.log('Going to ' + type + ': ' + link)
        }
      },
      updateFavorite(event) {
        axios
          .patch('http://localhost:4202/entry', { id: event.target.id, favorite: event.target.checked })
          .then((res) => {})
          .catch((err) => {
            console.log(err)
          })
      },
    },
  }
</script>

<style></style>
