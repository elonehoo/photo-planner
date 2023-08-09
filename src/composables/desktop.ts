const { width, height } = useWindowSize()

const PHONE_RATIO = 0.55

const isDesktop = computed(() => {
  return width.value > 500 && width.value / height.value > PHONE_RATIO
})

export {
  width,
  height,
  PHONE_RATIO,
  isDesktop
}
