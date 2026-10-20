import { saveAs } from 'file-saver'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Serializers, takeScreenshot } from '~composition/photo'

vi.mock('file-saver', () => ({ saveAs: vi.fn() }))
vi.mock('html2canvas', () => ({
  default: vi.fn(async () => ({
    toBlob: (callback: BlobCallback) => callback(new Blob(['photo'])),
  })),
}))

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe('fallback serializers', () => {
  for (const kind of ['any', 'string'] as const) {
    it(`${kind} preserves falsy values and falls back only for nullish input`, () => {
      for (const value of [0, false, '', 'photo', 42])
        expect(Serializers[kind].read(value, 'fallback')).toBe(value)
      expect(Serializers[kind].read(null, 'fallback')).toBe('fallback')
      expect(Serializers[kind].read(undefined, 'fallback')).toBe('fallback')
    })
  }
})

it('sanitizes the default screenshot filename on repeated calls', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-20T06:12:34Z'))
  await takeScreenshot()
  await takeScreenshot()
  expect(saveAs).toHaveBeenCalledTimes(2)
  for (const [, filename] of vi.mocked(saveAs).mock.calls)
    expect(filename).toBe('foto-rehearsal-2026-10-20-06-12-34.png')
})
