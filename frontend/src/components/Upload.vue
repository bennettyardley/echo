<template>
  <div>
    <!-- <div class="card max-w-xs bg-primary aspect-square overflow-hidden">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" class="mx-auto my-auto text-2xl" viewBox="0 0 16 16">
        <path
          d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
        <path
          d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
      </svg>
      <input class="fileInput" type="file" id="drop" @change="handleFileUpload($event)" @drop="handleFileDrop($event)" multiple />
    </div> -->

    <img src="http://localhost:4202/image/IMG_5069.png" />

    <file-pond
      name="test"
      ref="pond"
      instantUpload="false"
      allow-multiple="true"
      allowRevert="false"
      accepted-file-types="image/jpeg, image/png"
      v-bind:server="myServer"
      @init="handleFilePondInit" />
  </div>
</template>

<script>
  import vueFilePond from 'vue-filepond'
  import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'

  const FilePond = vueFilePond(FilePondPluginImagePreview, FilePondPluginFileValidateType)

  export default {
    name: 'Upload',
    components: {
      FilePond,
    },
    data() {
      return {
        myServer: {
          process: async (fieldName, file, metadata, load) => {
            await this.uploadFileInChunks(file)
            load()
          },
          load: (source, load) => {
            return true
          },
        },
        myFiles: [],
      }
    },

    methods: {
      handleFilePondInit: function () {},

      async uploadFileInChunks(file) {
        return new Promise(async (resolve, reject) => {
          const dataKey = import.meta.env.VITE_DETA
          const projectId = dataKey.split('_')[0]
          const headers = { 'X-API-Key': dataKey }
          const drive = `https://drive.deta.sh/v1/${projectId}/echo`
          const maxChunkSize = 10 * 1024 * 1024 // 10MB
          const fileSize = file.size

          if (fileSize <= maxChunkSize) {
            // File is small enough to upload in a single request
            const formData = new FormData()
            formData.append('file', file)

            // Upload the file directly <--- THIS DOESN'T WORK NEEDS TO SEND AS PLAIN DATA NOT FORM
            await fetch(`${drive}/files?name=${file.name}`, {
              method: 'POST',
              body: formData,
              headers,
            })
            resolve(true)
          } else {
            // File is larger, initiate chunked upload
            const initiateUploadResponse = await fetch(`${drive}/uploads?name=${file.name}`, {
              method: 'POST',
              headers,
            })
            const { upload_id } = await initiateUploadResponse.json()

            // Split the file into chunks
            let offset = 0
            let part = 1

            // Array to store promises for each chunk upload
            const chunkUploadPromises = []

            while (offset < fileSize) {
              const chunkSize = Math.min(maxChunkSize, fileSize - offset)
              const chunk = file.slice(offset, offset + chunkSize)

              // Create an XHR object for chunk uploads
              const xhr = new XMLHttpRequest()

              // Track upload progress for each chunk
              xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                  const percentComplete = (e.loaded / e.total) * 100
                }
              })

              // Configure the XHR request for chunk upload
              xhr.open('POST', `${drive}/uploads/${upload_id}/parts?name=${file.name}&part=${part}`, true)

              // Set the appropriate headers for binary data
              xhr.setRequestHeader('Content-Type', 'application/octet-stream')
              xhr.setRequestHeader('X-API-Key', dataKey)

              // Create a promise for this chunk upload
              const chunkUploadPromise = new Promise((resolve, reject) => {
                xhr.onload = () => {
                  if (xhr.status === 200) {
                    resolve()
                  } else {
                    reject(`Chunk upload failed with status code: ${xhr.status}`)
                  }
                }

                xhr.onerror = () => {
                  reject('Chunk upload failed due to network error')
                }
              })

              // Send the chunk data directly as a blob
              xhr.send(chunk)

              // Add the promise to the array
              chunkUploadPromises.push(chunkUploadPromise)

              offset += chunkSize
              part++
            }

            // Wait for all chunk uploads to complete successfully
            await Promise.all(chunkUploadPromises)

            // Finalize the upload
            await fetch(`${drive}/uploads/${upload_id}?name=${file.name}`, {
              method: 'PATCH',
              headers,
            })
            resolve(true)
          }
        })
      },
    },
  }
</script>

<style>
  .filepond--credits {
    display: none !important;
  }
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
