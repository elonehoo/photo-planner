<script setup lang="ts">
import { takeScreenshot } from '~composition/photo'
import { popup } from '~composition/popup'
import { loadPosts, savePosts } from '~composition/post'
import { openDb } from '~composition/db'
import { PHONE_RATIO, CONFIG_PREFIX, TOAST_TIMEOUT } from '~composition/constant'

useHead({
  title: import.meta.env.VITE_APP_TITLE,
})

let db:any
let toastTimer:any

openDb().then(async(i) => {
  db = i
  window.db = db
  posts.value = await loadPosts(db, tab.value)
})

const tab = useStorage(`${CONFIG_PREFIX}-tab`, 0)
const dark = useStorage(`${CONFIG_PREFIX}-dark`, false)
const gap = useStorage(`${CONFIG_PREFIX}-gap`, 3)
const shooting = ref(false)
const locked = ref(false)
const inPopup = ref(window.name === 'photo-planner')
const posts = ref<any>([])
const toast = ref('')

// 0: photo, 1: thief, 2: pattele
const imageMode = ref<number>(0)

const { width, height } = useWindowSize()

const isDesktop = computed(() => {
  return width.value > 500 && width.value / height.value > PHONE_RATIO
})

const caseWidth = computed(() => {
  return Math.min(
    width.value,
    isDesktop.value
      ? height.value * PHONE_RATIO - 5
      : width.value,
  )
})

const caseStyle = computed(() => ({
  width: `${caseWidth.value}px`,
}))

const size = computed(() => {
  return (caseWidth.value - gap.value * 2) / 3
})

const shoot = () => {
  shooting.value = true
  toast.value = 'Taking Screenshot'
  nextTick(() => {
    takeScreenshot()
    shooting.value = false
  })
}

const openPopup = async() => {
  locked.value = true
  toast.value = 'Poped'
  await popup(location.href, 'foto-rehearse', caseWidth.value, height.value)
  location.reload()
}

const addFront = () => {
  posts.value.unshift({ url: '' })
}

const toggleDark = () => {
  dark.value = !dark.value
  toast.value = dark.value ? 'Dark mode' : 'Light mode'
}

const toggleGap = () => {
  gap.value = gap.value ? 0 : 3
  toast.value = gap.value ? 'Gap on' : 'Gap off'
}
const switchMode = () => {
  imageMode.value = (imageMode.value + 1) % 3
  toast.value = ['Image mode', 'Color mode', 'Pattle mode'][imageMode.value]
}

const switchTab = () => {
  tab.value = (tab.value + 1) % 3
  toast.value = `Tab ${tab.value + 1}`
}

watch(
  posts,
  () => {
    savePosts(db, posts.value, tab.value)
  }, {
    deep: true,
  },
)


watch(
  tab,
  async() => {
    posts.value = await loadPosts(db, tab.value)
  },
)

watch(
  toast,
  () => {
    if (toast.value) {
      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => {
        toast.value = ''
      }, TOAST_TIMEOUT)
    }
  },
)

const dragging = ref(false)

const drop = (to:any, e:any) => {
  dragging.value = false
  const from = +e.dataTransfer.getData('idx')
  posts.value.splice(to, 0, posts.value.splice(from, 1)[0])
}

const dragend = () => {
  dragging.value = false
}

const allowDrop = (e:any) => {
  e.preventDefault()
  return false
}

const drag = (idx:any, e:any) => {
  dragging.value = true
  e.dataTransfer.setData('idx', idx)
  try {
    window.navigator.vibrate(100)
  }
  catch {}
}

const handleUploaded = (index:any, urls:any) => {
  for (let i = 0; i < urls.length; i++) {
    // append to tail
    if (!posts.value[i + index])
      posts.value.push({ url: urls[i] })
    // insert into middle
    else if (posts.value[i + index].url)
      posts.value.splice(i + index, 0, { url: urls[i] })
    // replace empty
    else
      posts.value[i + index].url = urls[i]
  }
}

const add = () => {
  posts.value.push({ url: '' })
}
</script>

<template>
  <div v-if="!locked" class="app" :class="{dark, shooting}">
    <div id="phone-case" :style="caseStyle">
      <div id="phone-case-inner">

        <div class="nav">
          <!-- header -->
          <div v-if="width > 300" class="header">
            Photo<br><b>Planner</b>
          </div>
          <!-- buttons -->
          <div v-show="!shooting" class="buttons">
            <button type="button" class="icon button" title="Take Screenshot" @click="shoot">
              <div class="i-mdi-light-camera" />
            </button>

            <button v-if="isDesktop && !inPopup" type="button" class="icon button" title="Popup" @click="openPopup">
              <div class="i-mdi-light-arrange-send-backward" />
            </button>

            <button type="button" class="icon button" title="New Post" @click="addFront">
              <div class="i-mdi-light-plus-circle" />
            </button>

            <button type="button" class="icon button" :title="dark ? 'Light Mode' : 'Dark Mode'" @click="toggleDark">
              <div :class="[dark ? 'i-mdi-light-lightbulb-on' : 'i-mdi-light-lightbulb']" />
            </button>

            <button type="button" class="icon button" title="Toggle Gap" @click="toggleGap">
              <div :class="[gap ? 'i-mdi-light-border-all' : 'i-mdi-light-border-outside']" />
            </button>

            <button type="button" class="icon button" title="Switch mode" @click="switchMode">
              <div :class="[imageMode === 0 ? 'i-mdi-light-picture' : imageMode === 1 ? 'i-mdi-light-flask-empty' : 'i-mdi-light-flask']" />
            </button>

            <button type="button" class="icon button" title="Switch Tabs" @click="switchTab">
              <div class="i-mdi-light-shape-circle" />
              <span class="number font-bold">{{ tab + 1 }}</span>
            </button>
          </div>
        </div>

        <div class="grid" :style="{ gridGap: `${gap}px` }">
          <Post
            v-for="(post, idx) in posts"
            :key="idx"
            :post="post"
            :size="size"
            :mode="imageMode"
            :shooting="shooting"
            :draggable="true"
            @drop.native="(e:any)=>drop(idx, e)"
            @dragend.native="dragend"
            @dragover.native="allowDrop"
            @dragenter.native="allowDrop"
            @dragstart.native="(e:any)=>drag(idx, e)"
            @upload="(urls:any)=>handleUploaded(idx,urls)"
          />
          <post
            v-show="!shooting"
            :size="size"
            @click.native="add"
          >
            <div class="icon">
              <div class="i-mdi-light-plus-circle w-1em h-1em" />
            </div>
          </post>
        </div>

        <div v-if="!shooting" class="footer">
          <div class="powered">
            powered by
            <a href="https://github.com/vitejs/vite">vite</a>
            ,
            <a href="https://github.com/vueuse/vueuse">vueuse</a>
            ・
            source on <a href="https://github.com/elonehoo/photo-planner">Github</a>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style>
:root {
  --theme-primary: #d37070;
  --post-width: 100px;
  --theme-foreground: rgba(0,0,0,0.867);
  --theme-foreground-fade: rgba(0,0,0,0.4);
  --theme-background: #fff;
  --theme-shadow: rgba(0,0,0,0.031);
}
html,
body,
.app {
  user-select: none;
  margin: 0;
  height: 100vh;
  width: 100vw;
  background: #222;
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  font-weight: 100;
}
.app {
  color: var(--theme-foreground);
}
.app.dark {
  --theme-foreground: #fff;
  --theme-background: #000;
  --theme-foreground-fade: rgba(255,255,255,0.533);
  --theme-shadow: rgba(255,255,255,0.094);
}
a {
  text-decoration: none !important;
  color: var(--theme-primary) !important;
}
.tabs {
  padding: 0.5rem 1rem;
}
.tabs .tab {
  padding: 0.5rem;
  display: inline-block;
  color: var(--theme-primary);
  cursor: pointer;
  margin: 0 0.1rem;
  width: 0.8rem;
  height: 0.8rem;
  line-height: 0.8rem;
  text-align: center;
}
.tabs .tab.active {
  background: var(--theme-primary);
  color: var(--theme-background);
  font-weight: normal;
}
.icon.button {
  display: inline-block;
  font-size: 1.4rem;
  cursor: pointer;
  padding: 0.3rem;
  position: relative;
  background: none;
  border: none;
  outline: none;
  border-radius: 2px;
  text-align: center;
  line-height: 1.4rem;
  color: inherit;
}
.icon.button:hover {
  background: var(--theme-shadow);
}
.icon.button .number {
  position: absolute;
  left: 50%;
  top: 50%;
  text-align: center;
  transform: translate(-50%, -50%) translateX(-1px);
  font-size: 0.8rem;
  user-select: none;
}
#phone-case-inner {
  background: var(--theme-background);
}
#phone-case {
  background: var(--theme-background);
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}
#phone-case::-webkit-scrollbar {
  display: block;
  width: 0px;
}
#phone-case .nav {
  margin-bottom: 0.3rem;
  display: grid;
  grid-template-columns: max-content auto;
}
#phone-case .nav > * {
  margin: auto 0;
}
#phone-case .nav .header {
  padding: 1.3rem;
  font-size: 1.3rem;
  font-weight: 100;
  line-height: 1.3rem;
}
#phone-case .nav .buttons {
  padding: 1rem 0;
}
#phone-case .nav .buttons:first-child {
  padding: 1rem;
}
#phone-case .footer {
  padding: 1rem;
  font-size: 0.9rem;
  color: var(--theme-foreground-fade);
}
#phone-case .footer .powered {
  font-size: 0.8rem;
}
#phone-case .grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
.trashbin {
  position: fixed;
  bottom: 0;
  left: 50%;
  right: 0;
  padding: 1rem 0;
  background: #bd3a3a;
  color: #fff;
  transition: 0.2s ease-in;
  transform: translate(-50%, 100%);
  text-align: center;
  opacity: 1;
}
.trashbin.active {
  transform: translate(-50%, 0);
}
.toast {
  position: fixed;
  bottom: 20vh;
  left: 50%;
  transform: translate(-50%, 100%);
  padding: 0.7rem 1rem;
  min-width: 200px;
  text-align: center;
  transition: 0.2s ease-in-out;
  pointer-events: none;
  opacity: 0;
  font-size: 1.1rem;
  color: var(--theme-foregroud);
}
.toast.active {
  opacity: 1;
}
.toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.7;
  z-index: -1;
  border-radius: 0.3rem;
  background: var(--theme-background);
}
.toast::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  border-radius: 0.3rem;
  border: 1px solid var(--theme-background);
}

</style>
