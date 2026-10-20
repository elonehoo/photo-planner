/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  ColorThief: new () => {
    getPalette: (image: HTMLImageElement, count: number) => [number, number, number][]
  }
}
