<script setup lang="ts">
import chroma from "chroma-js"
import { getColors } from '~composition/colors'
import { getDataUrls } from '~composition/url'

const props = withDefaults(defineProps<{
  size: number
  mode: number
  post: any
  shooting: boolean
}>(),{
  size:0,
  mode:0,
  shooting: false,
  post:{
    url:''
  }
})

const emit = defineEmits(['upload'])

const colors = ref([])

onMounted(() => {
  watch(
    () => props.post.url,
    async() => {
      if (props.post.url)
        colors.value = await getColors(props.post.url, 5)
      else
        colors.value = []
    },
    { immediate: true, flush: 'pre' },
  )
})

const style = computed(() => {
  const obj:any = {
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

const infoStyle = computed(() => {
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

const onLoad = (e:any) => {
  loaded.value = true
  if (e.target.height > e.target.width)
    imageStyle.value = { width: '100%' }
  else
    imageStyle.value = { height: '100%' }
}

const onImageSelect = async(e:any) => {
  const urls = await getDataUrls(e.target.files)
  emit('upload', urls)
}
</script>

<template>
  <div ref="frame" class="frame" :style="style">
    <slot>
      <input
        v-if="!post.url || mode === 0"
        class="upload"
        type="file"
        multiple
        accept="image/*"
        title=" "
        @change="onImageSelect"
      >
      <pre v-if="mode === 1" class="info" :style="infoStyle">{{ info }}</pre>
      <div v-if="mode === 2" class="dots" :style="dotsStyle">
        <div v-for="c of colors.slice(1)" :key="c" class="dot" :style="{background:c}" />
      </div>
    </slot>
    <img
      v-show="mode === 0 && loaded && post.url"
      class="image"
      :style="imageStyle"
      :src="post.url"
      @load="onLoad"
    >
  </div>
</template>

<style>
.frame {
  background: var(--theme-shadow);
  position: relative;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  overflow: hidden;
  width: 100%;
}
.frame .image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.frame .upload {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  width: 100%;
}
.frame .icon {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 5rem;
  opacity: 0.1;
  transform: translate(-50%, -50%);
}
.frame .dots {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
.frame .dots .dot {
  border-radius: 50%;
}
.frame .info {
  font-family: 'Inconsolata', monospace;
  padding: 1rem;
  margin: 0;
  opacity: 0;
  transition: 0.2s ease-in;
}
.frame:hover .info {
  opacity: 1;
}
</style>
