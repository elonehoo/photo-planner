<script setup lang="ts">
</script>

<template>
  <button type="button" class="icon button" title="Switch mode" @click="switchMode">
    <div v-show="imageMode == 0" class="i-mdi-light-picture" />
    <div v-show="imageMode == 1" class="i-mdi-light-flask-empty" />
    <div v-show="imageMode == 2" class="i-mdi-light-flask" />
  </button>
</template>
