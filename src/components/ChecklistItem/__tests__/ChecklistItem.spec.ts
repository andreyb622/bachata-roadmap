import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ChecklistItem from '@/components/ChecklistItem/ChecklistItem.vue';

const props = { id: '0-0-0', text: 'Перенос веса на месте', checked: false };

describe('ChecklistItem', () => {
  it('reflects the checked prop', () => {
    const unchecked = mount(ChecklistItem, { props });
    expect(unchecked.find('input').element.checked).toBe(false);
    const checked = mount(ChecklistItem, { props: { ...props, checked: true } });
    expect(checked.find('input').element.checked).toBe(true);
  });

  it('emits toggle with the id once per change', async () => {
    const wrapper = mount(ChecklistItem, { props });
    await wrapper.find('input').setValue(true);
    expect(wrapper.emitted('toggle')).toEqual([['0-0-0']]);
  });

  it('renders the text inside the label', () => {
    const wrapper = mount(ChecklistItem, { props });
    expect(wrapper.find('label').text()).toBe(props.text);
  });

  it('adds the highlighted class only when requested', () => {
    expect(mount(ChecklistItem, { props }).find('label').classes()).not.toContain('is-highlighted');
    const highlighted = mount(ChecklistItem, { props: { ...props, highlighted: true } });
    expect(highlighted.find('label').classes()).toContain('is-highlighted');
  });

  it('exposes the id as data-item-id', () => {
    const wrapper = mount(ChecklistItem, { props });
    expect(wrapper.find('label').attributes('data-item-id')).toBe(props.id);
  });
});
