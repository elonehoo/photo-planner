<script setup lang="ts">
</script>

<template>
  <button type="button" class="icon button" title="Toggle Gap" @click="toggleGap">
    <div class="i-mdi-light-border-all" v-show="gap" />
    <div class="i-mdi-light-border-outside" v-show="!gap" />
  </button>
</template>
