<template>
  <div>
    <file-pond
      name="uploader"
      ref="pond"
      instantUpload="false"
      allow-multiple="true"
      allowRevert="false"
      accepted-file-types="image/jpeg, image/png"
      v-bind:server="myServer"
      @init="handleFilePondInit" />

    <input type="checkbox" v-model="artistModal" id="artistModal" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box flex flex-col justify-between max-w-none w-5/12 h-3/4">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeArtistModal">✕</button>

        <!-- Prompt -->
        <p class="text-center mt-4">Heads Up! This event had multiple artists, was that picture of a specific artist?</p>

        <!-- Centered artist list with Select All button -->
        <div class="flex flex-col mx-auto">
          <!-- Select All button -->
          <button class="btn btn-outline btn-primary mb-2" @click="selectAllArtists">All</button>

          <!-- Checkbox options for artists -->
          <div v-for="(artist, index) in artists" :key="index" class="flex items-center">
            <input type="checkbox" :id="'artist_' + index" v-model="selectedArtists" :value="artist" class="mr-2" />
            <label :for="'artist_' + index">{{ artist }}</label>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end mt-4">
          <!-- <button class="btn btn-outline mr-3" @click="closeArtistModal">Cancel</button> -->
          <button class="btn btn-success" @click="assignArtists">Assign</button>
        </div>
      </div>
      <label class="modal-backdrop" for="artistModal">Close</label>
    </div>
  </div>
</template>

<script>
  import vueFilePond from 'vue-filepond'
  import axios from 'axios'
  import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
  import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'

  import { keyStore } from '../stores/key'

  const FilePond = vueFilePond(FilePondPluginImagePreview, FilePondPluginFileValidateType)

  export default {
    setup() {
      const key = keyStore()

      return { key }
    },
    name: 'Upload',
    components: {
      FilePond,
    },
    props: ['id', 'artists'],
    data() {
      return {
        myServer: {
          process: async (fieldName, file, metadata, load) => {
            try {
              await this.uploadFileInChunks(file)
              if (this.artists.length > 1) {
                this.fileName = file.name
                this.artistModal = true
                await this.addMedia(file.name)
              } else {
                await this.addMedia(file.name)
                this.oneArtistMedia(file.name)
              }
              this.$emit('addedMedia', file.name)
              load()
            } catch (err) {
              console.log(err)
            }
          },
          load: (source, load) => {
            return true
          },
        },
        myFiles: [],
        artistModal: false,
        selectedArtists: [],
        fileName: '',
      }
    },

    methods: {
      handleFilePondInit: function () {},

      closeArtistModal() {
        this.artistModal = false
      },

      addMedia(name) {
        return new Promise(async (resolve, reject) => {
          await axios
            .put(import.meta.env.VITE_API + '/media', { id: this.id, media: name })
            .then((res) => {
              resolve(true)
            })
            .catch((err) => {
              console.log(err)
              reject(false)
            })
        })
      },

      artistMedia() {
        return new Promise(async (resolve, reject) => {
          await axios
            .put(import.meta.env.VITE_API + '/artist', { artists: this.selectedArtists, media: this.fileName })
            .then((res) => {
              this.fileName = ''
              resolve(true)
            })
            .catch((err) => {
              console.log(err)
              reject(false)
            })
        })
      },

      oneArtistMedia(name) {
        axios
          .put(import.meta.env.VITE_API + '/artist', { artists: this.artists, media: name })
          .then((res) => {})
          .catch((err) => {
            console.log(err)
          })
      },

      selectAllArtists() {
        this.selectedArtists = [...this.artists]
      },

      async assignArtists() {
        await this.artistMedia()
        this.artistModal = false
      },

      async uploadFileInChunks(file) {
        return new Promise(async (resolve, reject) => {
          const dataKey = this.key.apiKey
          const projectId = dataKey.split('_')[0]
          const headers = { 'X-API-Key': dataKey }
          const drive = `https://drive.deta.sh/v1/${projectId}/echo`
          const maxChunkSize = 10 * 1024 * 1024 // 10MB
          const fileSize = file.size

          if (fileSize <= maxChunkSize) {
            // File is small enough to upload in a single request
            const fileBlob = file.slice(0) // Create a Blob from the entire file

            // Upload the file directly as plain data
            await fetch(`${drive}/files?name=${file.name}`, {
              method: 'POST',
              body: fileBlob,
              headers: {
                ...headers,
                'Content-Type': 'application/octet-stream', // Set the content type to octet-stream
              },
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
