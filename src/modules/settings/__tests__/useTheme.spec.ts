import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { resolveTheme, useTheme } from '../useTheme';
import { useSettingsStore } from '../store';

const Probe = defineComponent({
  setup() {
    useTheme();
    return () => null;
  },
});

function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }),
  );
}

describe('resolveTheme', () => {
  it('resolves system by the media query and passes explicit themes through', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete document.documentElement.dataset.theme;
    document.documentElement.style.colorScheme = '';
    localStorage.clear();
  });

  it('applies an explicit theme to the root element', async () => {
    stubMatchMedia(false);
    const store = useSettingsStore();
    store.init(false);
    const wrapper = mount(Probe);
    store.setTheme('light');
    await wrapper.vm.$nextTick();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    wrapper.unmount();
  });

  it('follows the system preference for the system theme', async () => {
    stubMatchMedia(true);
    const store = useSettingsStore();
    store.init(false);
    const wrapper = mount(Probe);
    await wrapper.vm.$nextTick();
    expect(document.documentElement.dataset.theme).toBe('dark');
    wrapper.unmount();
  });

  it('sets the theme-color meta from the --bg token', async () => {
    stubMatchMedia(false);
    document.documentElement.style.setProperty('--bg', '#123456');
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', '#000000');
    document.head.appendChild(meta);
    const store = useSettingsStore();
    store.init(false);
    const wrapper = mount(Probe);
    await wrapper.vm.$nextTick();
    expect(meta.getAttribute('content')).toBe('#123456');
    wrapper.unmount();
    meta.remove();
    document.documentElement.style.removeProperty('--bg');
  });
});
