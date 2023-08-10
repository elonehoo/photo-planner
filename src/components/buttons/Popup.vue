<script setup lang="ts">
</script>

<template>
  <button v-if="isDesktop && !inPopup" type="button" class="icon button" title="Popup" @click="openPopup">
    <div class="i-mdi-light-arrange-send-backward"/>
  </button>
</template>
