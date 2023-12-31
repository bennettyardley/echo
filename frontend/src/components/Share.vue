<template>
  <div>
    <button class="btn" @click="generateAndDownloadImage">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-share-fill" viewBox="0 0 16 16">
        <path
          d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z" />
      </svg>
      Share
    </button>

    <div
      ref="contentToCapture"
      v-if="artists.length > 6"
      class="rounded-3xl overflow-hidden"
      :class="randColor"
      style="width: 800px; height: 1200px; position: absolute; left: -9999px">
      <!-- <div ref="contentToCapture" v-if="artists.length > 6" class="rounded-3xl overflow-hidden" :class="randColor" style="width: 800px"> -->
      <div class="px-2 overflow-visible">
        <p class="text-8xl uppercase font-bold">{{ venue }}</p>
        <p class="text-3xl">presents</p>
        <div class="grid grid-cols-3 gap-3 mt-5">
          <p v-for="artist in artists" :key="artist" class="text-4xl">{{ artist }}</p>
        </div>
      </div>
      <div class="overflow-hidden logo-preview-inner" style="height: 400px">
        <img class="" :src="img" />
      </div>
      <div class="flex flex-col px-2" style="height: 400px">
        <div class="flex flex-row h-full">
          <div class="my-auto">
            <p class="text-3xl">date</p>
            <p class="text-7xl uppercase font-bold">{{ dateStr }}</p>
          </div>
        </div>
        <div class="name">Echo</div>
      </div>
    </div>

    <div
      v-else
      ref="contentToCapture"
      class="rounded-3xl overflow-hidden"
      :class="randColor"
      style="width: 800px; height: 1200px; position: absolute; left: -9999px">
      <!-- <div v-else ref="contentToCapture" class="rounded-3xl overflow-hidden" :class="randColor" style="width: 800px; height: 1200px"> -->
      <div class="px-2" style="height: 400px">
        <p class="text-8xl uppercase font-bold">{{ venue }}</p>
        <p class="text-3xl">presents</p>
        <div class="grid grid-cols-2 gap-4 mt-5">
          <p v-for="artist in artists" :key="artist" :class="artists.length < 3 ? 'text-6xl' : 'text-4xl'">{{ artist }}</p>
        </div>
      </div>
      <div class="overflow-hidden logo-preview-inner" style="height: 400px">
        <img class="" :src="img" />
      </div>
      <div class="flex flex-col px-2" style="height: 400px">
        <div class="flex flex-row h-full">
          <div class="my-auto">
            <p class="text-3xl">date</p>
            <p class="text-7xl uppercase font-bold">{{ dateStr }}</p>
          </div>
        </div>
        <div class="name">Echo</div>
      </div>
    </div>
  </div>
</template>

<script>
  import html2canvas from 'html2canvas'
  const defaultImg = new URL('../assets/missingVenue.jpg', import.meta.url)

  export default {
    data() {
      return {
        dateStr: new Date().toDateString(),
        img: defaultImg,
        url: import.meta.env.VITE_API,
        colors: ['bg-primary', 'bg-secondary', 'bg-success', 'bg-warning'],
        randColor: '',
      }
    },
    beforeMount() {
      this.randColor = this.colors[Math.floor(Math.random() * this.colors.length)]
    },
    props: ['artists', 'venue', 'date', 'media'],
    watch: {
      date(to) {
        this.dateStr = new Date(to).toDateString()
      },
      media: {
        handler: function (to) {
          if (to) {
            if (to.length > 0) {
              this.img = this.url + '/image/' + to[0]
            } else this.img = defaultImg
          }
        },
        deep: true,
      },
    },
    methods: {
      async generateAndDownloadImage() {
        const contentToCapture = this.$refs.contentToCapture
        const canvas = await html2canvas(contentToCapture, {
          dpi: window.devicePixelRatio * 2,
          backgroundColor: null,
          useCORS: true,
        })

        // Convert canvas to image and trigger download as PNG
        const imgData = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = imgData
        link.download = 'ticket.png' // Set the desired filename with .png extension
        link.click()
        this.randColor = this.colors[Math.floor(Math.random() * this.colors.length)]
      },
    },
  }
</script>

<style scoped>
  .name {
    top: 120px;
    left: 0px;
    width: 100%;
    text-transform: uppercase;
    font-family: 'Libre Barcode 39 Extended Text', cursive;
    font-size: 85px;
    text-align: center;
    opacity: 1;
    padding: 7px;
    color: #e9e5ff;
    letter-spacing: 5px;
  }

  .logo-preview-inner {
    height: 400px;
    width: 800px;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .logo-preview-inner img {
    width: 100%;
  }
</style>
