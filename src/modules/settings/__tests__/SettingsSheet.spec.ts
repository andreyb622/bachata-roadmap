import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import SettingsSheet from '../components/SettingsSheet/SettingsSheet.vue';
import { useSettingsStore } from '../store';

let wrapper: VueWrapper | null = null;

describe('SettingsSheet', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    useSettingsStore().init(false);
    wrapper = mount(SettingsSheet, { props: { open: true }, attachTo: document.body });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it('hides the language control by default', () => {
    expect(document.body.querySelector('[data-test="locale-ru"]')).toBeNull();
  });

  it('shows the language control in development and saves the chosen locale', () => {
    wrapper?.unmount();
    vi.stubEnv('MODE', 'development');
    wrapper = mount(SettingsSheet, { props: { open: true }, attachTo: document.body });
    const labels = [...document.body.querySelectorAll('[data-test^="locale-"]')].map((label) =>
      label.textContent?.trim(),
    );
    expect(labels).toEqual(['Как в системе', 'Русский', 'English', 'Español']);
    document.body.querySelector<HTMLInputElement>('[data-test="locale-en"] input')?.click();
    expect(useSettingsStore().locale).toBe('en');
    expect(localStorage.getItem('bachata-settings-v1')).toContain('"locale":"en"');
  });

  it('renders three theme radios with the system one checked', () => {
    const labels = [...document.body.querySelectorAll('.settings-sheet__option')].map((label) =>
      label.textContent?.trim(),
    );
    expect(labels).toEqual(['Как в системе', 'Светлая', 'Тёмная']);
    const system = document.body.querySelector<HTMLInputElement>(
      '[data-test="theme-system"] input',
    );
    expect(system?.checked).toBe(true);
  });

  it('saves the chosen theme', () => {
    const dark = document.body.querySelector<HTMLInputElement>('[data-test="theme-dark"] input');
    dark?.click();
    expect(useSettingsStore().theme).toBe('dark');
    expect(localStorage.getItem('bachata-settings-v1')).toContain('"theme":"dark"');
  });
});
