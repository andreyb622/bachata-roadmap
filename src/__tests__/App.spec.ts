import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '@/App.vue';

describe('App', () => {
  it('renders title', () => {
    expect(mount(App).text()).toContain('Bachata Roadmap');
  });
});
