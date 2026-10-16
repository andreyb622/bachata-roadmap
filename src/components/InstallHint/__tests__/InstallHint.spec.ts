import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import InstallHint from '@/components/InstallHint/InstallHint.vue';

const HTML_CLASS = 'install-hint-visible';
const HEIGHT_VAR = '--install-hint-h';

async function flush(): Promise<void> {
  await nextTick();
  await nextTick();
}

describe('InstallHint', () => {
  afterEach(() => {
    document.documentElement.classList.remove(HTML_CLASS);
    document.documentElement.style.removeProperty(HEIGHT_VAR);
  });

  it('adds the html class when visible', async () => {
    const wrapper = mount(InstallHint, { props: { visible: true }, attachTo: document.body });
    await flush();
    expect(document.documentElement.classList.contains(HTML_CLASS)).toBe(true);
    wrapper.unmount();
  });

  it('writes the height custom property when the hint has a height', async () => {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get: () => 70,
    });
    try {
      const wrapper = mount(InstallHint, { props: { visible: true }, attachTo: document.body });
      await flush();
      expect(document.documentElement.style.getPropertyValue(HEIGHT_VAR)).toBe('70px');
      wrapper.unmount();
    } finally {
      if (original) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', original);
      else delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetHeight;
    }
  });

  it('removes the class and property when hidden', async () => {
    const wrapper = mount(InstallHint, { props: { visible: true }, attachTo: document.body });
    await flush();
    await wrapper.setProps({ visible: false });
    expect(document.documentElement.classList.contains(HTML_CLASS)).toBe(false);
    expect(document.documentElement.style.getPropertyValue(HEIGHT_VAR)).toBe('');
    wrapper.unmount();
  });

  it('removes the class and property on unmount', async () => {
    const wrapper = mount(InstallHint, { props: { visible: true }, attachTo: document.body });
    await flush();
    wrapper.unmount();
    expect(document.documentElement.classList.contains(HTML_CLASS)).toBe(false);
    expect(document.documentElement.style.getPropertyValue(HEIGHT_VAR)).toBe('');
  });

  it('emits close on button click', async () => {
    const wrapper = mount(InstallHint, { props: { visible: true }, attachTo: document.body });
    await wrapper.get('[data-test="install-hint-close"]').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
    wrapper.unmount();
  });
});
