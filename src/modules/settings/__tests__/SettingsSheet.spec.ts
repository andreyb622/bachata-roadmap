import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import SettingsSheet from '../components/SettingsSheet/SettingsSheet.vue';
import { useSettingsStore } from '../store';

const localeSwitch = vi.hoisted(() => ({ enabled: true }));

vi.mock('@/shared/config/locales', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/config/locales')>()),
  isLocaleSwitchEnabled: () => localeSwitch.enabled,
}));

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
    localeSwitch.enabled = true;
  });

  it('shows the language control when the locale switch is enabled', () => {
    expect(document.body.querySelector('[data-test="locale-ru"]')).not.toBeNull();
  });

  it('hides the language control when the locale switch is disabled', () => {
    wrapper?.unmount();
    localeSwitch.enabled = false;
    wrapper = mount(SettingsSheet, { props: { open: true }, attachTo: document.body });
    expect(document.body.querySelector('[data-test="locale-ru"]')).toBeNull();
  });

  it('lists the locales and saves the chosen locale when the switch is enabled', () => {
    const labels = [...document.body.querySelectorAll('[data-test^="locale-"]')].map((label) =>
      label.textContent?.trim(),
    );
    expect(labels).toEqual(['Как в системе', 'Русский', 'English', 'Español']);
    document.body.querySelector<HTMLInputElement>('[data-test="locale-en"] input')?.click();
    expect(useSettingsStore().locale).toBe('en');
    expect(localStorage.getItem('bachata-settings-v1')).toContain('"locale":"en"');
  });

  it('renders three theme radios with the system one checked', () => {
    const labels = [...document.body.querySelectorAll('[data-test^="theme-"]')].map((label) =>
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
