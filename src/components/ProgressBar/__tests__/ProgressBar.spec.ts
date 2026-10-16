import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ProgressBar from '@/components/ProgressBar/ProgressBar.vue';

describe('ProgressBar', () => {
  it.each([0, 42])('renders %i percent', (percent) => {
    const wrapper = mount(ProgressBar, { props: { percent } });
    expect(wrapper.find('[data-test="progress-percent"]').text()).toBe(`${percent}%`);
    expect(wrapper.find('progress').element.value).toBe(percent);
  });

  it('labels the progress element', () => {
    const wrapper = mount(ProgressBar, { props: { percent: 10 } });
    const progress = wrapper.find('progress');
    const labelId = progress.attributes('aria-labelledby') ?? '';
    expect(labelId).not.toBe('');
    expect(wrapper.find(`[id="${labelId}"]`).text()).toBe('Прогресс');
  });
});
