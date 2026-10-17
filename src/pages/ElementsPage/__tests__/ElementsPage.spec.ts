import { afterEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { ELEMENTS_PAGE } from '@/modules/elements';
import ElementsPage from '@/pages/ElementsPage/ElementsPage.vue';

let wrapper: VueWrapper | null = null;

async function mountPage() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/elements', component: ElementsPage }],
  });
  await router.push('/elements');
  await router.isReady();
  wrapper = mount(ElementsPage, { global: { plugins: [pinia, router] }, attachTo: document.body });
  await flushPromises();
  return wrapper;
}

describe('ElementsPage', () => {
  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it('renders the intro', async () => {
    const page = await mountPage();
    expect(page.find('.elements-page__intro').text()).toBe(ELEMENTS_PAGE.intro);
  });

  it('renders module badges and the solo table badge', async () => {
    const page = await mountPage();
    const badges = page.findAll('.elements-page__badge').map((badge) => badge.text());
    expect(badges).toHaveLength(6);
    expect(badges).toContain('Модуль 1 — Основы');
    expect(badges).toContain('Сводный перечень сольных элементов (Уровень 1)');
  });

  it('renders all section headers with counters', async () => {
    const page = await mountPage();
    expect(page.findAll('[data-test="section-header"]')).toHaveLength(41);
    const counts = page.findAll('[data-test="section-count"]');
    expect(counts[0]?.text()).toBe('15');
    expect(counts[counts.length - 1]?.text()).toBe('17');
  });

  it('opens only the first section of each block by default', async () => {
    const page = await mountPage();
    const visible = page.findAll('[data-test="section-body"]').filter((body) => body.isVisible());
    expect(visible).toHaveLength(6);
  });

  it('toggles a collapsed section', async () => {
    const page = await mountPage();
    const headers = page.findAll('[data-test="section-header"]');
    const bodies = page.findAll('[data-test="section-body"]');
    expect(bodies[1]?.isVisible()).toBe(false);
    await headers[1]?.trigger('click');
    expect(bodies[1]?.isVisible()).toBe(true);
    await headers[1]?.trigger('click');
    expect(bodies[1]?.isVisible()).toBe(false);
  });

  it('renders item notes', async () => {
    const page = await mountPage();
    const notes = page.findAll('em.elements-page__note');
    expect(notes).toHaveLength(4);
    expect(notes.some((note) => note.text() === '(сольно)')).toBe(true);
  });

  it('separates the item text from its note with a space', async () => {
    const page = await mountPage();
    const itemTexts = page.findAll('li.elements-page__item').map((item) => item.text());
    expect(itemTexts.some((text) => text.includes('Rompe adelante (сольно)'))).toBe(true);
  });

  it('renders the solo elements table', async () => {
    const page = await mountPage();
    expect(page.findAll('.elements-page__table th').map((cell) => cell.text())).toEqual([
      '№',
      'Элемент',
      'Модуль',
    ]);
    expect(page.findAll('.elements-page__table tbody tr')).toHaveLength(17);
  });
});
