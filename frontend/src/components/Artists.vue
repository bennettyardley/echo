<template>
  <div>
    <div class="container flex">
      <div class="col my-auto"><p class="text-3xl">Top Artists</p></div>
      <div class="col ml-auto">
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-outline rounded-btn">All Time ▼</label>
          <ul tabindex="0" class="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4">
            <li><a>Last 3 Months</a></li>
            <li><a>Last Year</a></li>
            <li><a>Last 5 Years</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="grid grid-rows-2 grid-cols-4 gap-2 pt-8">
      <div class="mask mask- col-span-2 row-span-2 aspect-square overflow-hidden relative rounded-3xl">
        <a @click="toArtist" class="link">
          <img src="../assets/IMG_5069.png" />
          <figcaption class="absolute px-7 text-center text-lg text-white top-5">Lorem1</figcaption>
          <figcaption class="absolute px-7 text-center text-sm text-white top-12">2 Times</figcaption>
        </a>
      </div>
      <div class="aspect-square overflow-hidden relative rounded-3xl">
        <a @click="toArtist" class="link">
          <img src="../assets/IMG_5312.png" />
          <figcaption class="absolute px-4 text-center text-sm text-white top-5">Lorem2</figcaption>
          <figcaption class="absolute px-4 text-center text-xs text-white top-10">1 Time</figcaption>
        </a>
      </div>
      <div class="aspect-square overflow-hidden relative rounded-3xl">
        <a @click="toArtist" class="link">
          <img src="../assets/IMG_5069.png" />
          <figcaption class="absolute px-4 text-center text-sm text-white top-5">Test</figcaption>
          <figcaption class="absolute px-4 text-center text-xs text-white top-10">1 Time</figcaption>
        </a>
      </div>
      <div class="aspect-square overflow-hidden relative rounded-3xl">
        <a @click="toArtist" class="link">
          <img src="../assets/IMG_5069.png" />
          <figcaption class="absolute px-4 text-center text-sm text-white top-5">Test</figcaption>
          <figcaption class="absolute px-4 text-center text-xs text-white top-10">1 Time</figcaption>
        </a>
      </div>
      <div class="aspect-square overflow-hidden relative rounded-3xl">
        <a @click="toArtist" class="link">
          <img src="../assets/IMG_5069.png" />
          <figcaption class="absolute px-4 text-center text-sm text-white top-5">Test</figcaption>
          <figcaption class="absolute px-4 text-center text-xs text-white top-10">1 Time</figcaption>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Artists',
    methods: {
      toArtist() {
        console.log('here')
      },
    },
  }
</script>

<style></style>
