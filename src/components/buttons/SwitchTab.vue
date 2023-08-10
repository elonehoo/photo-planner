<script setup lang="ts">
</script>

<template>
<button type="button" class="icon button" title="Switch Tabs" @click="switchTab">
  <div class="i-mdi-light-shape-circle" />
  <span class="number font-bold">{{ tab + 1 }}</span>
</button>
</template>
