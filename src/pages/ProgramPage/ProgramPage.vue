<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ChecklistItem from '@/components/ChecklistItem/ChecklistItem.vue';
import ProgressBar from '@/shared/ui/ProgressBar/ProgressBar.vue';
import SectionCard from '@/shared/ui/SectionCard/SectionCard.vue';
import { useSectionCollapse } from '@/composables/useSectionCollapse';
import { PROGRAM } from '@/data/program';
import { periodPercent, sectionCounter } from '@/lib/progress';
import { ROUTE_NAMES } from '@/shared/config/route-names';
import { useProfilesStore } from '@/stores/useProfilesStore';

const HIGHLIGHT_DURATION_MS = 2000;

const route = useRoute();
const router = useRouter();
const pageRef = useTemplateRef<HTMLElement>('page');
const period = computed(() => PROGRAM[Number(route.params.period)]);

const store = useProfilesStore();
const { activeProgress } = storeToRefs(store);
const percent = computed(() =>
  period.value ? periodPercent(period.value, activeProgress.value) : 0,
);
const { isOpen, toggle, open } = useSectionCollapse();

const highlightedId = ref<string | null>(null);
let highlightTimer: ReturnType<typeof setTimeout> | undefined;

function clearHighlightTimer(): void {
  clearTimeout(highlightTimer);
  highlightTimer = undefined;
}

function findSectionIndex(itemId: string): number {
  return (
    period.value?.sections.findIndex((section) =>
      section.items.some((item) => item.id === itemId),
    ) ?? -1
  );
}

function clearItemQuery(): void {
  router.replace({ name: ROUTE_NAMES.program, params: route.params, query: {} });
}

watch(
  () => route.query.item,
  async (itemId) => {
    if (itemId === undefined) return;
    clearHighlightTimer();
    highlightedId.value = null;
    const sectionIndex = typeof itemId === 'string' ? findSectionIndex(itemId) : -1;
    if (typeof itemId !== 'string' || !period.value || sectionIndex === -1) {
      clearItemQuery();
      return;
    }
    open(period.value.id, sectionIndex);
    highlightedId.value = itemId;
    await nextTick();
    if (route.query.item !== itemId) return;
    pageRef.value?.querySelector(`[data-item-id="${itemId}"]`)?.scrollIntoView({ block: 'center' });
    highlightTimer = setTimeout(() => {
      highlightedId.value = null;
    }, HIGHLIGHT_DURATION_MS);
    clearItemQuery();
  },
  { immediate: true, flush: 'post' },
);

onBeforeUnmount(clearHighlightTimer);
</script>

<template>
  <section ref="page" class="program-page">
    <template v-if="period">
      <span class="program-page__badge" data-test="period-badge">{{ period.badge }}</span>
      <ProgressBar :percent="percent" />
      <SectionCard
        v-for="(section, index) in period.sections"
        :key="`${period.id}-${index}`"
        :title="section.title"
        :counter="sectionCounter(section, activeProgress)"
        :open="isOpen(period.id, index)"
        @toggle="toggle(period.id, index)"
      >
        <ChecklistItem
          v-for="item in section.items"
          :id="item.id"
          :key="item.id"
          :text="item.text"
          :checked="activeProgress[item.id] === true"
          :highlighted="item.id === highlightedId"
          @toggle="(id) => store.toggleItem(id)"
        />
      </SectionCard>
    </template>
  </section>
</template>

<style scoped src="./ProgramPage.css"></style>
