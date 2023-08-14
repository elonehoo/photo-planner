<script setup lang="ts">
useHead({
  title: import.meta.env.VITE_APP_TITLE,
})

</script>

<template>
  <div
   class="app"
   :class="{dark, shooting}"
  >
    <RouterView />
  </div>
</template>
