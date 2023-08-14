import { DEFAULT_IMAGES, DEFAULT_POSTS, STORE_PREFIX } from './constant'

export function openDb() {
  return new Promise((resolve) => {
    const request = window.indexedDB.open(STORE_PREFIX, 1)

    request.onerror = function (event) {
      alert(`Failed to open db:\n${event.toString()}`)
    }

    request.onsuccess = function (event) {
      resolve(request.result)
    }

    request.onupgradeneeded = function (event: any) {
      const db = event.target.result
      const stores = []
      for (let i = 0; i < 5; i++) {
        if (!db.objectStoreNames.contains(`posts-${i}`))
          stores.push(db.createObjectStore(`posts-${i}`, { keyPath: 'id' }))
      }

      for (let i = 0; i < DEFAULT_POSTS; i++)
        stores[0].put({ id: i, url: DEFAULT_IMAGES[i] || '' })
    }
  })
}
