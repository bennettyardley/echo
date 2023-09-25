<template>
  <div>
    <div class="card max-w-xs bg-primary aspect-square overflow-hidden">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" class="mx-auto my-auto text-2xl" viewBox="0 0 16 16">
        <path
          d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
        <path
          d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
      </svg>
      <input class="fileInput" type="file" id="drop" @change="handleFileUpload($event)" @drop="handleFileDrop($event)" />
    </div>
    <progress class="progress progress-secondary w-80" :value="uploadPercentage" max="100"></progress>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'Upload',
    data() {
      return {
        dragAndDropCapable: false,
        files: [],
        uploadPercentage: 0,
      }
    },

    mounted() {
      this.dragAndDropCapable = this.determineDragAndDropCapable()

      if (this.dragAndDropCapable) this.bindEvents()
    },

    methods: {
      bindEvents() {
        ;['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(
          function (evt) {
            document.getElementById('drop').addEventListener(
              evt,
              function (e) {
                e.preventDefault()
                e.stopPropagation()
              }.bind(this),
              false,
            )
          }.bind(this),
        )
      },

      handleFileDrop(event) {
        for (let i = 0; i < event.dataTransfer.files.length; i++) {
          this.files.push(event.dataTransfer.files[i])
        }

        this.submitFiles()
      },

      handleFileUpload(event) {
        this.files = event.target.files

        this.submitFiles()
      },

      determineDragAndDropCapable() {
        var div = document.createElement('div')
        return ('draggable' in div || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window
      },

      submitFiles() {
        this.uploadPercentage = 0
        let formData = new FormData()

        for (var i = 0; i < this.files.length; i++) {
          let file = this.files[i]

          formData.append('media', file)
        }

        axios
          .post('http://localhost:4202/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: function (progressEvent) {
              this.uploadPercentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100))
            }.bind(this),
          })
          .then(function () {})
          .catch(function () {
            console.log('Upload failed')
          })
        console.log(this.files)
        this.files = []
      },
    },
  }
</script>

<style scoped>
  .fileInput {
    cursor: pointer;
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 99;
    font-size: 50px;
    opacity: 0;
    -moz-opacity: 0;
  }
</style>
