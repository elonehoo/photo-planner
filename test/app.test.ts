import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { createHead } from '@vueuse/head'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { CONFIG_PREFIX, DEFAULT_POSTS } from '~composition/constant'
import { loadPosts, savePosts } from '~composition/post'
import App from '../src/App.vue'

vi.mock('../src/composition/db', () => ({
  openDb: vi.fn(async () => ({})),
}))
vi.mock('../src/composition/post', () => ({
  loadPosts: vi.fn(async () => [{ id: 0, url: '' }, { id: 1, url: '' }]),
  savePosts: vi.fn(),
}))
vi.mock('../src/composition/photo', () => ({
  takeScreenshot: vi.fn(async () => {}),
}))

describe('photo planner', () => {
  let wrapper: VueWrapper | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    window.innerWidth = 1200
    window.innerHeight = 800
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    localStorage.clear()
  })

  async function render() {
    wrapper = mount(App, {
      global: {
        plugins: [createHead()],
        stubs: {
          Post: {
            props: ['post', 'size', 'mode', 'shooting'],
            template: '<div data-test="post"><slot /></div>',
          },
        },
      },
    })
    await flushPromises()
    return wrapper
  }

  it('resolves native aliases and the Vite environment without legacy plugins', () => {
    expect(DEFAULT_POSTS).toBe(8)
    expect(import.meta.env.VITE_APP_TITLE).toBe('Photo Planner')
  })

  it('restores the saved tab and appearance', async () => {
    localStorage.setItem(`${CONFIG_PREFIX}-tab`, '1')
    localStorage.setItem(`${CONFIG_PREFIX}-dark`, 'true')
    const app = await render()
    expect(loadPosts).toHaveBeenCalledWith(expect.any(Object), 1)
    expect(app.get('.photo').classes()).toContain('dark')
    expect(app.get('button[title="Switch Tabs"]').text()).toBe('2')
    expect(app.findAll('[data-test="post"]')).toHaveLength(3)
  })

  it('persists appearance and tab changes', async () => {
    const app = await render()
    await app.get('button[title="Dark Mode"]').trigger('click')
    await nextTick()
    expect(app.get('.photo').classes()).toContain('dark')
    expect(localStorage.getItem(`${CONFIG_PREFIX}-dark`)).toBe('true')
    await app.get('button[title="Switch Tabs"]').trigger('click')
    await flushPromises()
    expect(localStorage.getItem(`${CONFIG_PREFIX}-tab`)).toBe('1')
    expect(loadPosts).toHaveBeenLastCalledWith(expect.any(Object), 1)
  })

  it('adds a post and saves the updated list', async () => {
    const app = await render()
    await app.get('button[title="New Post"]').trigger('click')
    expect(app.findAll('[data-test="post"]')).toHaveLength(4)
    expect(savePosts).toHaveBeenLastCalledWith(
      expect.any(Object),
      [{ url: '' }, { id: 0, url: '' }, { id: 1, url: '' }],
      0,
    )
  })

  it('updates the layout when the viewport becomes narrow', async () => {
    const app = await render()
    expect(app.find('button[title="Popup"]').exists()).toBe(true)
    window.innerWidth = 320
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(app.find('button[title="Popup"]').exists()).toBe(false)
    expect(app.get('#phone-case').attributes('style')).toContain('width: 320px')
  })
})
