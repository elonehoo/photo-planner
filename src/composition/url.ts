export function resizedataURL(url: any, MAX_WIDTH = 512, MAX_HEIGHT = 512) {
  const img = document.createElement('img')

  return new Promise((resolve) => {
    img.onload = function () {
      // We create a canvas and get its context.
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        }
      }
      else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height
          height = MAX_HEIGHT
        }
      }

      canvas.width = width
      canvas.height = height

      ctx!.drawImage(this, 0, 0, width, height)

      resolve(canvas.toDataURL())

      img.remove()
    }

    img.src = url
  })
}

export async function getDataUrls(files: any) {
  return await Promise.all(
    Array
      .from(files)
      .map((file: any) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.addEventListener('load', async () => {
            const url = reader.result
            const resized = await resizedataURL(url, 512, 512)
            resolve(resized)
          }, false)

          reader.readAsDataURL(file)
        })
      }),
  )
}
