<template>
  <div>
    <div class="card card-bordered overflow-hidden">
      <table class="table">
        <tbody>
          <tr v-for="n in 10" :key="n" @click="peek($event, 'entry', n)" class="hover:bg-secondary hover:text-primary-content">
            <th class="px-0">
              <div class="flex">
                <label class="swap swap-rotate mx-auto">
                  <input type="checkbox" />
                  <div class="swap-off">🤍</div>
                  <div class="swap-on">❤️</div>
                </label>
              </div>
            </th>
            <td class="pl-2">
              <a @click="peek($event, 'artist', 'Lorem' + n)" class="link link-hover">Lorem{{ n }}</a>
            </td>
            <td>
              <a @click="peek($event, 'venue', 'The Ave' + n)" class="link link-hover">The Ave{{ n }}</a>
            </td>
            <td class="text-right">1 Week Ago</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="container flex">
      <div class="join ml-auto">
        <button
          v-for="n in 4"
          :key="n"
          class="join-item btn btn-outline border-transparent hover:bg-transparent hover:text-primary-content hover:border-transparent">
          {{ n }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Entries',
    methods: {
      peek(into, type, link) {
        if (into.target.nodeName && into.target.nodeName.toLowerCase() === 'td') console.log('Going to ' + type + ': ' + link)
        else {
          if (type === 'artist') console.log('Going to ' + type + ': ' + link)
          else if (type === 'venue') console.log('Going to ' + type + ': ' + link)
        }
      },
    },
  }
</script>

<style></style>
