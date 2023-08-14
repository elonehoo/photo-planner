export function rgbToHex(r: any, g: any, b: any) {
  return `#${[r, g, b].map((x) => {
    const hex = x.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }).join('')}`
}

export async function getColors(url: string, amount = 5) {
  const img = document.createElement('img')
  await new Promise((resolve) => {
    img.onload = () => resolve()
    img.src = url
  })
  const palette = new window.ColorThief().getPalette(img, amount)
  return palette.map(rgb => rgbToHex(...rgb))
}
