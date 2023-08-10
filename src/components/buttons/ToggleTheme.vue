<script setup lang="ts">
</script>

<template>
  <button type="button" class="icon button" :title="isDark ? 'Light Mode' : 'Dark Mode'" @click="toggleDark">
    <div class="i-mdi-light-lightbulb-on dark:i-mdi-light-lightbulb" />
  </button>
</template>
