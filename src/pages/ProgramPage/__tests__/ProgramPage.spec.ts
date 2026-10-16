import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { resetSectionCollapse } from '@/composables/useSectionCollapse';
import { PROGRAM } from '@/data/program';
import ProgramPage from '@/pages/ProgramPage/ProgramPage.vue';
import { useProfilesStore } from '@/stores/useProfilesStore';

let wrapper: VueWrapper | null = null;

async function mountPage(path: string) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/program/:period(0|1|2)', component: ProgramPage }],
  });
  await router.push(path);
  await router.isReady();
  wrapper = mount(ProgramPage, { global: { plugins: [pinia, router] }, attachTo: document.body });
  await flushPromises();
  return { wrapper, router, store: useProfilesStore() };
}

function bodies(page: VueWrapper) {
  return page.findAll('[data-test="section-body"]');
}

describe('ProgramPage', () => {
  beforeEach(() => {
    localStorage.clear();
    resetSectionCollapse();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it('renders the period badge', async () => {
    const { wrapper } = await mountPage('/program/0');
    expect(wrapper.find('[data-test="period-badge"]').text()).toBe(PROGRAM[0].badge);
  });

  it('opens only the first section', async () => {
    const { wrapper } = await mountPage('/program/0');
    const visible = bodies(wrapper).map((body) => body.isVisible());
    expect(visible[0]).toBe(true);
    expect(visible.slice(1).every((value) => !value)).toBe(true);
  });

  it('checks and unchecks an item', async () => {
    const { wrapper, store } = await mountPage('/program/0');
    const total = PROGRAM[0].sections[0].items.length;
    const firstId = PROGRAM[0].sections[0].items[0].id;
    const counter = () => wrapper.find('[data-test="section-count"]').text();
    expect(counter()).toBe(`0/${total}`);

    const checkbox = wrapper.find('[data-test="checklist-item"] input');
    await checkbox.setValue(true);
    expect(counter()).toBe(`1/${total}`);
    expect(wrapper.find('[data-test="progress-percent"]').text()).not.toBe('0%');
    expect(store.activeProgress[firstId]).toBe(true);

    await checkbox.setValue(false);
    expect(counter()).toBe(`0/${total}`);
    expect(wrapper.find('[data-test="progress-percent"]').text()).toBe('0%');
    expect(store.activeProgress[firstId]).toBeUndefined();
  });

  it('collapses and expands a section', async () => {
    const { wrapper } = await mountPage('/program/0');
    const header = wrapper.find('[data-test="section-header"]');
    await header.trigger('click');
    expect(bodies(wrapper)[0]?.isVisible()).toBe(false);
    await header.trigger('click');
    expect(bodies(wrapper)[0]?.isVisible()).toBe(true);
  });

  it('shows another period and keeps collapse state when returning', async () => {
    const { wrapper, router } = await mountPage('/program/0');
    await wrapper.find('[data-test="section-header"]').trigger('click');

    await router.push('/program/1');
    await flushPromises();
    expect(wrapper.find('[data-test="period-badge"]').text()).toBe(PROGRAM[1].badge);
    expect(bodies(wrapper)[0]?.isVisible()).toBe(true);

    await router.push('/program/0');
    await flushPromises();
    expect(bodies(wrapper)[0]?.isVisible()).toBe(false);
  });
});
