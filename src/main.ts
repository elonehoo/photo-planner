import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import App from './App.vue'
import '@unocss/reset/tailwind.css'
import 'mobile-drag-drop/default.css'
import 'uno.css'

const head = createHead()

const app = createApp(App)

app.use(head)

app.mount('#app')
