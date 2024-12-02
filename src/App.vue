<script setup lang="ts">
import { CONFIG_PREFIX, PHONE_RATIO, TOAST_TIMEOUT } from '~composition/constant'
import { openDb } from '~composition/db'
import { takeScreenshot } from '~composition/photo'
import { popup } from '~composition/popup'
import { loadPosts, savePosts } from '~composition/post'

useHead({
  title: import.meta.env.VITE_APP_TITLE,
})

let db: any
let toastTimer: any

const tab = useStorage(`${CONFIG_PREFIX}-tab`, 0)
const dark = useStorage(`${CONFIG_PREFIX}-dark`, false)
const gap = useStorage(`${CONFIG_PREFIX}-gap`, 3)
const shooting = ref(false)
const locked = ref(false)
const inPopup = ref(window.name === 'photo-planner')
const posts = ref<any>([])
const toast = ref('')

openDb().then(async (i) => {
  db = i
  window.db = db
  posts.value = await loadPosts(db, tab.value)
})

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
  },
  {
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

function dropRemove(e: any) {
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
            @drop="(e:any) => drop(idx, e)"
            @dragend="dragend"
            @dragover="allowDrop"
            @dragenter="allowDrop"
            @dragstart="(e:any) => drag(idx, e)"
            @upload="(urls:any) => handleUploaded(idx, urls)"
          />
          <post
            v-show="!shooting"
            :size="size"
            @click="add"
          >
            <div class="absolute text-5rem opacity-10 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <div class="i-mdi-light-plus-circle w-1em h-1em" />
            </div>
          </post>
        </div>

        <div v-if="!shooting" class="p-1rem text-0.9rem text-[var(--theme-foreground-fade)]">
          <div class="text-0.8rem">
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
    <div
      class="fixed bottom-20vh left-1/2 -translate-x-2/4 translate-y-full min-w-200px text-center duration-0.2s ease-in-out pointer-events-none opacity-0 text-1.1rem text-[var(--theme-foregroud)] px-4 py-0.7rem [&::before]:content-[''] [&::before]:absolute [&::before]:opacity-70 [&::before]:z--1 [&::before]:rounded-0.3rem [&::before]:inset-0 [&::before]:[background:var(--theme-background)] [&::after]:content-[''] [&::after]:absolute [&::after]:z-[-1] [&::after]:border [&::after]:border-[color:var(--theme-background)] [&::after]:rounded-[0.3rem] [&::after]:border-solid [&::after]:inset-0"
      :class="{ 'op-100!': !!toast }"
    >
      {{ toast }}
    </div>
    <div
      v-show="!shooting"
      class="fixed text-white duration-200 ease-in -translate-x-2/4 translate-y-full text-center opacity-100 px-0 py-4 left-1/2 right-0 bottom-0 [background:#bd3a3a]"
      :class="{ 'op-100! -translate-x-2/4! translate-y-0!': dragging }"
      :style="caseStyle"
      @drop="dropRemove"
      @dragenter="allowDrop"
      @dragover="allowDrop"
    >
      Drop here to Remove
    </div>
  </div>
</template>
