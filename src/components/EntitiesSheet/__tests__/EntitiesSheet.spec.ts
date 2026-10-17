import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import EntitiesSheet from '@/components/EntitiesSheet/EntitiesSheet.vue';
import { useToast } from '@/shared/composables/useToast';
import { routes } from '@/router';
import { useProfilesStore } from '@/stores/useProfilesStore';

let wrapper: VueWrapper | null = null;

async function mountSheet(extraNames: string[] = []) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const store = useProfilesStore();
  extraNames.forEach((name) => store.createEntity(name));
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push('/search');
  await router.isReady();
  wrapper = mount(EntitiesSheet, {
    props: { open: true, 'onUpdate:open': (value: boolean) => wrapper?.setProps({ open: value }) },
    global: { plugins: [pinia, router] },
    attachTo: document.body,
  });
  await wrapper.vm.$nextTick();
  return { store };
}

function query(selector: string): HTMLElement | null {
  return document.body.querySelector<HTMLElement>(selector);
}

async function flush() {
  await wrapper!.vm.$nextTick();
  await wrapper!.vm.$nextTick();
}

describe('EntitiesSheet', () => {
  beforeEach(() => {
    localStorage.clear();
    useToast().clear();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    useToast().clear();
  });

  it('renders rows with percents and the active badge', async () => {
    await mountSheet(['Маша']);
    const rows = document.body.querySelectorAll('[data-test="entity-row"]');
    expect(rows).toHaveLength(2);
    expect(rows[1]?.textContent).toContain('Маша');
    expect(rows[1]?.textContent).toContain('0%');
    expect(rows[1]?.textContent).toContain('активен');
  });

  it('refuses to delete the last entity without a dialog', async () => {
    const { store } = await mountSheet();
    query('[data-test="entity-delete"]')?.click();
    await flush();
    expect(query('[data-test="confirm-accept"]')).toBeNull();
    expect(useToast().current.value).toBe('Нельзя удалить последнего ученика или группу');
    expect(store.entities).toHaveLength(1);
  });

  it('asks for confirmation and keeps both entities on cancel', async () => {
    const { store } = await mountSheet(['Маша']);
    query('[data-test="entity-delete"]')?.click();
    await flush();
    expect(document.body.textContent).toContain('Удалить «Мой прогресс»? Прогресс будет потерян.');
    query('[data-test="confirm-cancel"]')?.click();
    await flush();
    expect(store.entities).toHaveLength(2);
  });

  it('deletes an entity on confirm and toasts', async () => {
    const { store } = await mountSheet(['Маша']);
    query('[data-test="entity-delete"]')?.click();
    await flush();
    query('[data-test="confirm-accept"]')?.click();
    await flush();
    expect(store.entities).toHaveLength(1);
    expect(useToast().current.value).toBe('Удалено: Мой прогресс');
  });

  it('closes only the dialog on Escape', async () => {
    await mountSheet(['Маша']);
    query('[data-test="entity-delete"]')?.click();
    await flush();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await flush();
    expect(query('[data-test="confirm-accept"]')).toBeNull();
    expect(query('[data-test="entity-row"]')).not.toBeNull();
  });

  it('switches the entity and toasts', async () => {
    const { store } = await mountSheet(['Маша']);
    const first = store.entities[0]!;
    query('[data-test="entity-row"] [data-test="entity-switch"]')?.click();
    await flush();
    expect(store.activeEntityId).toBe(first.id);
    expect(useToast().current.value).toBe(`Выбрано: ${first.name}`);
  });
});
