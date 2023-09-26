import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vSelect from 'vue-select'
import VueDatePicker from '@vuepic/vue-datepicker'

import 'vue-select/dist/vue-select.css'
import '@vuepic/vue-datepicker/dist/main.css'
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('v-select', vSelect)
app.component('VueDatePicker', VueDatePicker)

app.mount('#app')
