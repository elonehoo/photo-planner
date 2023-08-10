<script setup lang="ts">
const caseWidth = computed(() => {
  return Math.min(
    width.value,
    isDesktop.value
      ? height.value * PHONE_RATIO - 5
      : width.value,
  )
})

const caseStyle = computed(() => ({
  width: `${caseWidth.value}px`,
}))

</script>

<template>
  <div
   id="phone-case"
   :style="caseStyle"
  >
    <div id="phone-case-inner">
      <Nav>
        <Title />
        <div v-show="!shooting" class="buttons">
          <Buttons />
        </div>
      </Nav>
      <PostBody>

      </PostBody>
    </div>
  </div>
</template>
