import { afterEach, describe, expect, it, vi } from 'vitest'
import { popup } from '~composition/popup'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('popup', () => {
  it('focuses the new window and completes when it closes', async () => {
    const popupWindow = Object.assign(new EventTarget(), { focus: vi.fn() })
    const open = vi.spyOn(window, 'open').mockReturnValue(popupWindow as unknown as Window)
    const closed = popup('https://example.test', 'preview', 320, 640)
    expect(open).toHaveBeenCalledWith('https://example.test', 'preview', 'height=640,width=320')
    expect(popupWindow.focus).toHaveBeenCalledOnce()
    popupWindow.dispatchEvent(new Event('beforeunload'))
    await expect(closed).resolves.toBeUndefined()
  })

  it('keeps rejecting when the browser blocks the new window', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null)
    await expect(popup('https://example.test', 'preview', 320, 640)).rejects.toThrow(TypeError)
  })
})
