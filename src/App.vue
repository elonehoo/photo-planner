<script setup lang="ts">
import { takeScreenshot } from '~composition/photo'
import { popup } from '~composition/popup'
import { loadPosts, savePosts } from '~composition/post'
import { openDb } from '~composition/db'
import { CONFIG_PREFIX, PHONE_RATIO, TOAST_TIMEOUT } from '~composition/constant'

useHead({
  title: import.meta.env.VITE_APP_TITLE,
})

let db: any
let toastTimer: any

openDb().then(async (i) => {
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

function shoot() {
  shooting.value = true
  toast.value = 'Taking Screenshot'
  nextTick(() => {
    takeScreenshot()
    shooting.value = false
  })
}

async function openPopup() {
  locked.value = true
  toast.value = 'Poped'
  await popup(location.href, 'foto-rehearse', caseWidth.value, height.value)
  location.reload()
}

function addFront() {
  posts.value.unshift({ url: '' })
}

function toggleDark() {
  dark.value = !dark.value
  toast.value = dark.value ? 'Dark mode' : 'Light mode'
}

function toggleGap() {
  gap.value = gap.value ? 0 : 3
  toast.value = gap.value ? 'Gap on' : 'Gap off'
}
function switchMode() {
  imageMode.value = (imageMode.value + 1) % 3
  toast.value = ['Image mode', 'Color mode', 'Pattle mode'][imageMode.value]
}

function switchTab() {
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
  async () => {
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

function drop(to: any, e: any) {
  dragging.value = false
  const from = +e.dataTransfer.getData('idx')
  posts.value.splice(to, 0, posts.value.splice(from, 1)[0])
}

function dragend() {
  dragging.value = false
}

function allowDrop(e: any) {
  e.preventDefault()
  return false
}

function drag(idx: any, e: any) {
  dragging.value = true
  e.dataTransfer.setData('idx', idx)
  try {
    window.navigator.vibrate(100)
  }
  catch {}
}

function handleUploaded(index: any, urls: any) {
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

function add() {
  posts.value.push({ url: '' })
}

const dropRemove = (e:any) => {
  dragging.value = false
  const from = +e.dataTransfer.getData('idx')
  posts.value.splice(from, 1)
}
</script>

<template>
  <div
   v-if="!locked"
   class="photo select-none m-0 h-100vh w-100vw bg-dark-400 font-mono font-thin text-[var(--theme-foreground)]"
   :class="{ dark, shooting }"
  >
    <div
     id="phone-case"
     :style="caseStyle"
     class="bg-[var(--theme-background)] h-100vh overflow-y-auto overflow-x-hidden relative left-1/2 -translate-x-2/4 scrollbar-none [&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:w-0px"
    >
      <div
       id="phone-case-inner"
       class="bg-[var(--theme-background)]"
      >
        <div class="mb-0.3rem [&>*]:m-auto-0 grid grid-cols-auto">
          <!-- header -->
          <div
           v-if="width > 300"
           class="p-1.3rem text-1.3rem font-thin leading-1.3rem"
          >
            <span
             class="flex items-center justify-start"
            >
              Photo
            </span>
            <b>Planner</b>
          </div>
          <!-- buttons -->
          <div
           v-show="!shooting"
           class="px-0 py-4 [&:first-chile]:p-1rem"
          >
            <IconButton title="Take Screenshot" @click="shoot">
              <div class="i-mdi-light-camera" />
            </IconButton>

            <IconButton v-if="isDesktop && !inPopup" title="Popup" @click="openPopup">
              <div class="i-mdi-light-arrange-send-backward" />
            </IconButton>

            <IconButton title="New Post" @click="addFront">
              <div class="i-mdi-light-plus-circle" />
            </IconButton>

            <IconButton :title="dark ? 'Light Mode' : 'Dark Mode'" @click="toggleDark">
              <div :class="[dark ? 'i-mdi-light-lightbulb-on' : 'i-mdi-light-lightbulb']" />
            </IconButton>

            <IconButton title="Toggle Gap" @click="toggleGap">
              <div :class="[gap ? 'i-mdi-light-border-all' : 'i-mdi-light-border-outside']" />
            </IconButton>

            <IconButton title="Switch mode" @click="switchMode">
              <div :class="[imageMode === 0 ? 'i-mdi-light-picture' : imageMode === 1 ? 'i-mdi-light-flask-empty' : 'i-mdi-light-flask']" />
            </IconButton>

            <IconButton title="Switch Tabs" @click="switchTab">
              <div class="i-mdi-light-shape-circle" />
              <span
               class="absolute top-1/2 left-40% text-0.8rem select-none -translate-x-2/4 -translate-y-2/4 -translate-x-px text-center"
              >
                {{ tab + 1 }}
              </span>
            </IconButton>
          </div>
        </div>

        <div class="grid grid-cols-1fr" :style="{ gridGap: `${gap}px` }">
          <Post
            v-for="(post, idx) in posts"
            :key="idx"
            :post="post"
            :size="size"
            :mode="imageMode"
            :shooting="shooting"
            :draggable="true"
            @drop.native="(e:any) => drop(idx, e)"
            @dragend.native="dragend"
            @dragover.native="allowDrop"
            @dragenter.native="allowDrop"
            @dragstart.native="(e:any) => drag(idx, e)"
            @upload="(urls:any) => handleUploaded(idx, urls)"
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
    <div class="toast" :class="{ active: !!toast }">
      {{ toast }}
    </div>
    <div
      v-show="!shooting"
      class="trashbin"
      :class="{active:dragging}"
      :style="caseStyle"
      @drop.native="dropRemove"
      @dragenter.native="allowDrop"
      @dragover.native="allowDrop"
    >
      Drop here to Remove
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

.photo.dark {
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

#phone-case .footer {
  padding: 1rem;
  font-size: 0.9rem;
  color: var(--theme-foreground-fade);
}
#phone-case .footer .powered {
  font-size: 0.8rem;
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
