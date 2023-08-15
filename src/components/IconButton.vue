<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <button
    type="button"
    class="inline-block text-1.4rem cursor-pointer p-0.3rem relative background-none text-center leading-1.4rem text-inherit rounded-sm border-style-none outline-none hover:bg-[var(--theme-shadow)]"
    :title="title"
  >
    <slot />
  </button>
</template>
