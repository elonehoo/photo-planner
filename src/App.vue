<script setup lang="ts">
useHead({
  title: import.meta.env.VITE_APP_TITLE,
})
</script>

<template>
  <main font-sans p="x-4 y-10" text="center gray-700 dark:gray-200">
    <RouterView />
    <TheFooter />
  </main>
</template>
