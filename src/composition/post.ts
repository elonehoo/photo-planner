import { DEFAULT_POSTS } from './constant'

export function loadPosts(db: any, tab: number = 0): any {
  return new Promise((resolve) => {
    const store = db.transaction([`posts-${tab}`], 'readwrite')
      .objectStore(`posts-${tab}`)
    const request = store.getAll()
    request.onsuccess = () => {
      let posts = request.result
      if (!posts || !posts.length) {
        /* eslint-disable unicorn/no-new-array */
        posts = new Array(DEFAULT_POSTS)
          .fill(null)
          .map((_, id) => ({ id, url: '' }))
      }
      posts.sort((a: any, b: any) => a.id - b.id)
      resolve(posts)
    }
  })
}

export function savePosts(db: any, posts: any[] = [], tab: number = 0) {
  const store = db.transaction([`posts-${tab}`], 'readwrite')
    .objectStore(`posts-${tab}`)

  const count = posts.length

  store.clear()

  for (let i = 0; i < count; i++)
    store.put({ id: i.toString(), url: posts[i].url })
}
