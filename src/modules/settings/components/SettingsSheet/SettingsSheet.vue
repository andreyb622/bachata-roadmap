<script setup lang="ts">
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet.vue';
import { useSettingsStore } from '../../store';
import type { Theme } from '../../storage';

const open = defineModel<boolean>('open', { default: false });

const store = useSettingsStore();

const options: { value: Theme; label: string }[] = [
  { value: 'system', label: 'Как в системе' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
];
</script>

<template>
  <BottomSheet v-model:open="open" title="Настройки">
    <fieldset class="settings-sheet__group">
      <legend class="settings-sheet__legend">Тема</legend>
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
        <span>{{ option.label }}</span>
      </label>
    </fieldset>
  </BottomSheet>
</template>

<style scoped src="./SettingsSheet.css"></style>
