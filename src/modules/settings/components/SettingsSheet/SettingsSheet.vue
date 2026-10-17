<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet.vue';
import { useSettingsStore } from '../../store';
import type { Theme } from '../../storage';

const open = defineModel<boolean>('open', { default: false });

const { t } = useI18n();
const store = useSettingsStore();

const options: { value: Theme; labelKey: string }[] = [
  { value: 'system', labelKey: 'settings.themeOptions.system' },
  { value: 'light', labelKey: 'settings.themeOptions.light' },
  { value: 'dark', labelKey: 'settings.themeOptions.dark' },
];
</script>

<template>
  <BottomSheet v-model:open="open" :title="t('settings.title')">
    <fieldset class="settings-sheet__group">
      <legend class="settings-sheet__legend">{{ t('settings.theme') }}</legend>
      <label
        v-for="option in options"
        :key="option.value"
        class="settings-sheet__option"
        :data-test="`theme-${option.value}`"
      >
        <input
          type="radio"
          name="theme"
          :value="option.value"
          :checked="store.theme === option.value"
          @change="store.setTheme(option.value)"
        />
        <span>{{ t(option.labelKey) }}</span>
      </label>
    </fieldset>
  </BottomSheet>
</template>

<style scoped src="./SettingsSheet.css"></style>
