import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import SectionCard from '@/components/SectionCard/SectionCard.vue';

let wrapper: VueWrapper | null = null;

function mountCard(open: boolean) {
  wrapper = mount(SectionCard, {
    props: { title: 'Разминка', counter: '1/2', open },
    slots: { default: '<p data-test="slot-content">content</p>' },
    attachTo: document.body,
  });
  return wrapper;
}

describe('SectionCard', () => {
  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it('renders title and counter', () => {
    const card = mountCard(true);
    expect(card.find('[data-test="section-header"]').text()).toContain('Разминка');
    expect(card.find('[data-test="section-count"]').text()).toBe('1/2');
  });

  it('follows the open prop', () => {
    const closed = mountCard(false);
    expect(closed.find('[data-test="section-header"]').attributes('aria-expanded')).toBe('false');
    expect(closed.find('[data-test="section-body"]').isVisible()).toBe(false);
    closed.unmount();
    const opened = mountCard(true);
    expect(opened.find('[data-test="section-header"]').attributes('aria-expanded')).toBe('true');
    expect(opened.find('[data-test="section-body"]').isVisible()).toBe(true);
    expect(opened.find('[data-test="slot-content"]').exists()).toBe(true);
  });

  it('emits toggle on header click', async () => {
    const card = mountCard(true);
    await card.find('[data-test="section-header"]').trigger('click');
    expect(card.emitted('toggle')).toHaveLength(1);
  });

  it('omits the counter when it is not provided', () => {
    wrapper = mount(SectionCard, { props: { title: 'Разминка', open: true } });
    expect(wrapper.find('[data-test="section-count"]').exists()).toBe(false);
  });

  it('adds the catalog modifier class for the catalog variant', () => {
    wrapper = mount(SectionCard, { props: { title: 'Разминка', open: true, variant: 'catalog' } });
    expect(wrapper.classes()).toContain('section-card--catalog');
  });

  it('has no modifier class without a variant', () => {
    const card = mountCard(true);
    expect(card.classes()).not.toContain('section-card--catalog');
  });
});
