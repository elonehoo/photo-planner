import { createHead } from '@vueuse/head'
import { createApp } from 'vue'
import App from './App.vue'
import 'mobile-drag-drop/default.css'
import './styles/main.css'
import 'uno.css'

const head = createHead()

const app = createApp(App)

app.use(head)

app.mount('#app')
