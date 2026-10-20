export async function popup(url: any, name: any, width: any, height: any) {
  return new Promise<void>((resolve) => {
    const newWin = window.open(url, name, `height=${height},width=${width}`)
    newWin?.addEventListener('beforeunload', () => resolve())
    newWin?.focus()
  })
}
