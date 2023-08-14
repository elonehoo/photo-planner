import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'

export default defineConfig({
  shortcuts: [
  ],
  rules: [
    ['grid-cols-auto', { 'grid-template-columns': 'max-content auto' }],
    ['grid-cols-1fr', { 'grid-template-columns': '1fr 1fr 1fr' }],
    ['scrollbar-none', { 'scrollbar-width': 'none' }],
    ['m-auto-0', { 'margin': 'auto 0' }],
    ['background-none', { 'background': 'none' }],
    ['outline-none', { 'outline': 'none' }],
    ['border-style-none', { 'border': 'none' }],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1,
      warn: true,
    }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
})
