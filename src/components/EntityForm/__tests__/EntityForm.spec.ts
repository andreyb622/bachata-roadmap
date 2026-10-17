import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import EntityForm from '@/components/EntityForm/EntityForm.vue';
import { useToast } from '@/shared/composables/useToast';
import { routes } from '@/router';
import { useProfilesStore } from '@/stores/useProfilesStore';

let wrapper: VueWrapper | null = null;

async function mountForm(entityId: string | null = null) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push('/search');
  await router.isReady();
  wrapper = mount(EntityForm, {
    props: {
      open: false,
      entityId,
      'onUpdate:open': (value: boolean) => wrapper?.setProps({ open: value }),
    },
    global: { plugins: [pinia, router] },
    attachTo: document.body,
  });
  await wrapper.setProps({ open: true });
  await wrapper.vm.$nextTick();
  return { router, store: useProfilesStore() };
}

function input(): HTMLInputElement {
  return document.body.querySelector<HTMLInputElement>('[data-test="entity-input"]')!;
}

async function typeAndSubmit(value: string) {
  input().value = value;
  input().dispatchEvent(new Event('input'));
  document.body.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  await wrapper!.vm.$nextTick();
  await wrapper!.vm.$nextTick();
}

describe('EntityForm', () => {
  beforeEach(() => {
    localStorage.clear();
    useToast().clear();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    useToast().clear();
  });

  it.each(['', '   '])('rejects the empty name %j and stays open', async (value) => {
    const { store } = await mountForm();
    const before = store.entities.length;
    await typeAndSubmit(value);
    expect(useToast().current.value).toBe('Введите имя или название');
    expect(input()).not.toBeNull();
    expect(store.entities).toHaveLength(before);
  });

  it('rejects a name longer than 50 characters', async () => {
    await mountForm();
    await typeAndSubmit('а'.repeat(51));
    expect(useToast().current.value).toBe('Слишком длинное имя — сократите до 50 символов');
    expect(input()).not.toBeNull();
  });

  it('creates a trimmed entity, opens tab 0 and closes', async () => {
    const { store, router } = await mountForm();
    await typeAndSubmit('  Маша  ');
    expect(store.entities.map((entity) => entity.name)).toContain('Маша');
    expect(useToast().current.value).toBe('Создано: Маша');
    await vi.waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/program/0'));
    expect(document.body.querySelector('[data-test="entity-input"]')).toBeNull();
  });

  it('submits on Enter through the form submit event', async () => {
    const { store } = await mountForm();
    await typeAndSubmit('Группа А');
    expect(store.entities.map((entity) => entity.name)).toContain('Группа А');
  });

  it('prefills and renames in edit mode', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const existing = useProfilesStore().entities[0]!;
    wrapper = null;
    await mountForm(existing.id);
    expect(input().value).toBe(existing.name);
    await typeAndSubmit('Новое имя');
    expect(useToast().current.value).toBe('Имя обновлено');
    expect(useProfilesStore().entities.map((entity) => entity.name)).toContain('Новое имя');
  });
});
