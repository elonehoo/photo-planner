<script setup lang="ts">
withDefaults(defineProps<{
  size?: number
  mode?: number
  shooting?: boolean
  post?: any
}>(),({
  size: 0,
  mode: 0,
  shooting: false,
  post:{
    url:''
  }
}))
</script>

<template>

</template>
