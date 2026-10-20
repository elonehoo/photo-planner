import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import UnoCss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import DeployInfo from 'unplugin-deploy-info/vite'
import Components from 'unplugin-vue-components/vite'
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import Chai from 'vite-plugin-chai'
import Classify from 'vite-plugin-classify'
import PKG from 'vite-plugin-package-configs'

export default defineConfig({
  resolve: {
    alias: {
      '~components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '~styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '~composition': fileURLToPath(new URL('./src/composition', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    // https://github.com/vitejs/vite-plugin-vue
    Vue(),

    // https://github.com/elonehoo/unplugin-auto-import-api
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        '@vueuse/head',
        'vitest',
      ],
      dts: true,
      dirs: [
        './src/composables',
      ],
      vueTemplate: true,
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      dts: true,
    }),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    UnoCss(),

    // https://github.com/elonehoo/vite-plugin-package-configs
    PKG(),

    // https://github.com/wip-elonehoo/vite-plugin-chai
    Chai(),

    // https://github.com/wip-elonehoo/vite-plugin-classify
    Classify(),

    // https://github.com/elonehoo/unplugin-deploy-info
    DeployInfo({
      info: [
        {
          name: 'Vue Docs',
          message: 'https://vuejs.org',
        },
        {
          name: 'Vite Docs',
          message: 'https://vitejs.dev',
        },
        {
          name: 'pinia Docs',
          message: 'https://pinia.vuejs.org',
        },
        {
          name: 'Router Docs',
          message: 'https://router.vuejs.org',
        },
        {
          name: 'VueUse Docs',
          message: 'https://vueuse.org',
        },
        {
          name: 'Unocss Docs',
          message: 'https://unocss.dev/interactive',
        },
        {
          name: 'Vitest Docs',
          message: 'https://vitest.dev',
        },
      ],
    }),
  ],
})
