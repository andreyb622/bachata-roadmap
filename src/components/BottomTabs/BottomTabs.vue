<script setup lang="ts">
import { TAB_ICONS, TAB_LABELS } from '@/data/program';

defineProps<{ activeTab: number | null }>();

const emit = defineEmits<{ select: [index: number] }>();
</script>

<template>
  <nav class="bottom-tabs" role="tablist">
    <button
      v-for="(label, i) in TAB_LABELS"
      :key="label"
      type="button"
      role="tab"
      class="bottom-tabs__tab"
      :aria-selected="activeTab === i"
      :data-test="`tab-${i}`"
      @click="emit('select', i)"
    >
      <span class="bottom-tabs__icon">{{ TAB_ICONS[i] }}</span>
      <span class="bottom-tabs__label">{{ label }}</span>
    </button>
  </nav>
</template>

<style scoped src="./BottomTabs.css"></style>
