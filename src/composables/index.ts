export * from './desktop'
export * from './utils'

export const tab = ref(0)
export const gap = ref(3)
export const dark = ref(false)

export const { width, height } = useWindowSize()
export const posts = ref([])
export const dragging = ref(false)
export const shooting = ref(false)
export const locked = ref(false)
export const toast = ref('')
export const imageMode = ref(0) // 0: photo, 1: thief, 2: pattele
export let db
export let toastTimer

 openDb().then(async(i) => {
  db = i
  window.db = db
  posts.value = await loadPosts(db, tab.value)
})

export const PHONE_RATIO = 0.55
export const isDesktop = computed(() => {
  return width.value > 500 && width.value / height.value > PHONE_RATIO
})
export const caseWidth = computed(() => {
  return Math.min(
    width.value,
    isDesktop.value
      ? height.value * PHONE_RATIO - 5
      : width.value,
  )
})
export const size = computed(() => {
  return (caseWidth.value - gap.value * 2) / 3
})
export const caseStyle = computed(() => ({
  width: `${caseWidth.value}px`,
}))
export const handleUploaded = (index, urls) => {
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
export const drop = (to, e) => {
  dragging.value = false
  const from = +e.dataTransfer.getData('idx')
  posts.value.splice(to, 0, posts.value.splice(from, 1)[0])
}
export const dropRemove = (e) => {
  dragging.value = false
  const from = +e.dataTransfer.getData('idx')
  posts.value.splice(from, 1)
}
export const drag = (idx, e) => {
  dragging.value = true
  e.dataTransfer.setData('idx', idx)
  try {
    window.navigator.vibrate(100)
  }
  catch {}
}
export const dragend = () => {
  dragging.value = false
}
export const allowDrop = (e) => {
  e.preventDefault()
  return false
}
export const add = () => {
  posts.value.push({ url: '' })
}
export const addFront = () => {
  posts.value.unshift({ url: '' })
}
export const openPopup = async() => {
  locked.value = true
  toast.value = 'Poped'
  await popup(location.href, 'foto-rehearse', caseWidth.value, height.value)
  location.reload()
}
export const shoot = () => {
  shooting.value = true
  toast.value = 'Taking Screenshot'
  nextTick(() => {
    takeScreenshot()
    shooting.value = false
  })
}
export const toggleDark = () => {
  dark.value = !dark.value
  toast.value = dark.value ? 'Dark mode' : 'Light mode'
}
export const toggleGap = () => {
  gap.value = gap.value ? 0 : 3
  toast.value = gap.value ? 'Gap on' : 'Gap off'
}
export const switchMode = () => {
  imageMode.value = (imageMode.value + 1) % 3
  toast.value = ['Image mode', 'Color mode', 'Pattle mode'][imageMode.value]
}
export const switchTab = () => {
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
