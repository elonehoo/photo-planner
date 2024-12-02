<script setup lang="ts">
import chroma from 'chroma-js'
import { getColors } from '~composition/colors'
import { getDataUrls } from '~composition/url'

const props = withDefaults(defineProps<{
  size?: number
  mode?: number
  post?: any
  shooting?: boolean
}>(), {
  size: 0,
  mode: 0,
  shooting: false,
  post: {
    url: '',
  },
})

const emit = defineEmits(['upload'])

const colors = ref([])

onMounted(() => {
  watch(
    () => props.post.url,
    async () => {
      if (props.post.url)
        colors.value = await getColors(props.post.url, 5)
      else
        colors.value = []
    },
    { immediate: true, flush: 'pre' },
  )
})

const style = computed(() => {
  const obj: any = {
    width: `${props.size}px`,
    height: `${props.size}px`,
  }
  if (props.post.url) {
    if (props.mode === 1 || props.mode === 2)
      obj.backgroundColor = colors.value[0]
  }
  else if (props.shooting) {
    obj.backgroundColor = 'transparent'
  }
  return obj
})

const info = computed(() => {
  if (!colors.value[0])
    return ''
  const hex = colors.value[0]
  const color = chroma(hex)
  const [hue, sat, light] = color.hsl()
  return `${hex}\n\n`
    + `lum ${Math.round(light * 100)}%\n`
    + `sat ${Math.round(sat * 100)}%\n`
    + `hue ${hue.toFixed(1)}°`
})

const infoStyle = computed<any>(() => {
  if (!colors.value[0])
    return {}
  const color = chroma(colors.value[0])
  return {
    color: color.luminance() > 0.5
      ? color.darken(2)
      : color.brighten(2),
  }
})

const gap = ref(8)

const dotsStyle = computed(() => {
  return {
    backgroundColor: colors.value[0],
    height: `${(props.size - gap.value * 5) / 4}px`,
    gridGap: `${gap.value}px`,
    padding: `${gap.value}px`,
  }
})

const loaded = ref(false)

const imageStyle = ref({})

function onLoad(e: any) {
  loaded.value = true
  if (e.target.height > e.target.width)
    imageStyle.value = { width: '100%' }
  else
    imageStyle.value = { height: '100%' }
}

async function onImageSelect(e: any) {
  const urls = await getDataUrls(e.target.files)
  emit('upload', urls)
}
</script>

<template>
  <div
    class="relative bg-no-repeat bg-center bg-cover overflow-hidden w-full [background:var(--theme-shadow)]"
    :style="style"
  >
    <slot>
      <input
        v-if="!post.url || mode === 0"
        class="absolute opacity-0 w-full inset-0"
        type="file"
        multiple
        accept="image/*"
        title=" "
        @change="onImageSelect"
      >
      <pre v-if="mode === 1" class="opacity-0 duration-200 ease-in m-0 p-4 hover:op-100" :style="infoStyle">{{ info }}</pre>
      <div v-if="mode === 2" class="absolute grid grid-cols-[1fr_1fr_1fr_1fr] bottom-0 inset-x-0" :style="dotsStyle">
        <div v-for="c of colors.slice(1)" :key="c" class="rounded-1/2" :style="{ background: c }" />
      </div>
    </slot>
    <img
      v-show="mode === 0 && loaded && post.url"
      class="absolute -translate-x-2/4 -translate-y-2/4 pointer-events-none left-2/4 top-2/4"
      :style="imageStyle"
      :src="post.url"
      @load="onLoad"
    >
  </div>
</template>
