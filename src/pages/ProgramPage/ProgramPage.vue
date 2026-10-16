<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ChecklistItem from '@/components/ChecklistItem/ChecklistItem.vue';
import ProgressBar from '@/components/ProgressBar/ProgressBar.vue';
import SectionCard from '@/components/SectionCard/SectionCard.vue';
import { useSectionCollapse } from '@/composables/useSectionCollapse';
import { PROGRAM } from '@/data/program';
import { periodPercent, sectionCounter } from '@/lib/progress';
import { useProfilesStore } from '@/stores/useProfilesStore';

const route = useRoute();
const period = computed(() => PROGRAM[Number(route.params.period)]);

const store = useProfilesStore();
const { activeProgress } = storeToRefs(store);
const percent = computed(() =>
  period.value ? periodPercent(period.value, activeProgress.value) : 0,
);
const { isOpen, toggle } = useSectionCollapse();
</script>

<template>
  <section class="program-page">
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
          @toggle="(id) => store.toggleItem(id)"
        />
      </SectionCard>
    </template>
  </section>
</template>

<style scoped src="./ProgramPage.css"></style>
