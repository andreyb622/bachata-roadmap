<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { TAB_ICONS } from '@/modules/program';

const TAB_LABEL_KEYS = [
  'shell.tabs.period0',
  'shell.tabs.period1',
  'shell.tabs.period2',
  'search.title',
] as const;

const { t } = useI18n();

defineProps<{ activeTab: number | null }>();

const emit = defineEmits<{ select: [index: number] }>();
</script>

<template>
  <nav class="bottom-tabs" role="tablist">
    <button
      v-for="(key, i) in TAB_LABEL_KEYS"
      :key="key"
      type="button"
      role="tab"
      class="bottom-tabs__tab"
      :aria-selected="activeTab === i"
      :data-test="`tab-${i}`"
      @click="emit('select', i)"
    >
      <span class="bottom-tabs__icon">{{ TAB_ICONS[i] }}</span>
      <span class="bottom-tabs__label">{{ t(key) }}</span>
    </button>
  </nav>
</template>

<style scoped src="./BottomTabs.css"></style>
