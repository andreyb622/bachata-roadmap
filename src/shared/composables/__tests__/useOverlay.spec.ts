import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import type { Ref } from 'vue';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { useOverlay } from '@/shared/composables/useOverlay';

const wrappers: VueWrapper[] = [];

function mountHost(isOpen: Ref<boolean>) {
  const Host = defineComponent({
    setup() {
      useOverlay(isOpen, () => {
        isOpen.value = false;
      });
      return () => h('div');
    },
  });
  const wrapper = mount(Host, { attachTo: document.body });
  wrappers.push(wrapper);
  return wrapper;
}

function pressEscape(): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
}

describe('useOverlay', () => {
  afterEach(() => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
    document.body.innerHTML = '';
    document.body.style.overflow = '';
  });

  it('closes only the topmost overlay on Escape', () => {
    const first = ref(true);
    const second = ref(true);
    mountHost(first);
    mountHost(second);
    pressEscape();
    expect(second.value).toBe(false);
    expect(first.value).toBe(true);
  });

  it('keeps body scroll locked until the last overlay closes', async () => {
    const first = ref(true);
    const second = ref(true);
    mountHost(first);
    mountHost(second);
    expect(document.body.style.overflow).toBe('hidden');
    second.value = false;
    await Promise.resolve();
    expect(document.body.style.overflow).toBe('hidden');
    first.value = false;
    await Promise.resolve();
    expect(document.body.style.overflow).toBe('');
  });

  it('returns focus to the opener', async () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const isOpen = ref(true);
    mountHost(isOpen);
    opener.blur();
    isOpen.value = false;
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(opener);
  });

  it('falls back through the opener chain to the first connected element', async () => {
    const rootOpener = document.createElement('button');
    document.body.append(rootOpener);
    rootOpener.focus();
    const rootOpen = ref(true);
    mountHost(rootOpen);

    const dialogOne = document.createElement('div');
    dialogOne.setAttribute('role', 'dialog');
    const openerOne = document.createElement('button');
    dialogOne.append(openerOne);
    document.body.append(dialogOne);
    openerOne.focus();
    const firstOpen = ref(true);
    mountHost(firstOpen);

    const dialogTwo = document.createElement('div');
    dialogTwo.setAttribute('role', 'dialog');
    const openerTwo = document.createElement('button');
    dialogTwo.append(openerTwo);
    document.body.append(dialogTwo);
    openerTwo.focus();
    const secondOpen = ref(true);
    mountHost(secondOpen);

    dialogOne.remove();
    dialogTwo.remove();
    secondOpen.value = false;
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(rootOpener);
  });

  it('does nothing on Escape when nothing is open', () => {
    const isOpen = ref(false);
    mountHost(isOpen);
    pressEscape();
    expect(isOpen.value).toBe(false);
  });
});
