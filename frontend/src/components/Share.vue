<template>
  <div>
    <button class="btn" @click="generateAndDownloadImage">Share</button>

    <div
      ref="contentToCapture"
      class="bg-secondary rounded-3xl overflow-hidden"
      style="width: 800px; height: 1200px; position: absolute; left: -9999px">
      <!-- <div ref="contentToCapture" class="bg-secondary rounded-3xl px-2 overflow-hidden" style="width: 800px; height: 1200px"> -->
      <div class="px-2" style="height: 400px">
        <p class="text-8xl uppercase font-bold">{{ venue }}</p>
        <p class="text-3xl">presents</p>
        <p class="text-5xl mt-5">{{ artists.join(', ') }}</p>
      </div>
      <div class="overflow-hidden" style="height: 400px">
        <img style="margin-top: -200px" :src="img" />
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
  const defaultImg = new URL('../assets/Echo_Transparent.png', import.meta.url)

  export default {
    data() {
      return {
        dateStr: new Date().toDateString(),
        img: defaultImg,
        url: import.meta.env.VITE_API,
      }
    },
    props: ['artists', 'venue', 'date', 'media'],
    watch: {
      date(to) {
        this.dateStr = new Date(to).toDateString()
      },
      media(to) {
        if (to.length > 0) {
          this.img = this.url + '/image/' + to[0]
        } else this.img = defaultImg
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
</style>
