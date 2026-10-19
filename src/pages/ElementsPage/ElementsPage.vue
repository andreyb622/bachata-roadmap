<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SectionCard from '@/shared/ui/SectionCard/SectionCard.vue';
import { getLocalizedElements } from '@/modules/elements';

const SOLO_KEY = 'solo';

const { locale } = useI18n();
const elements = computed(() => getLocalizedElements(locale.value));

const sectionKey = (moduleKey: string, sectionKeyPart: string) => `${moduleKey}/${sectionKeyPart}`;

const openKeys = ref<Set<string>>(
  new Set([
    ...elements.value.modules.flatMap((module) =>
      module.sections.slice(0, 1).map((section) => sectionKey(module.key, section.key)),
    ),
    SOLO_KEY,
  ]),
);

function toggle(key: string) {
  const next = new Set(openKeys.value);
  if (!next.delete(key)) next.add(key);
  openKeys.value = next;
}
</script>

<template>
  <section class="elements-page">
    <p class="elements-page__intro">{{ elements.intro }}</p>
    <template v-for="module in elements.modules" :key="module.key">
      <div class="elements-page__badge">{{ module.title }}</div>
      <SectionCard
        v-for="section in module.sections"
        :key="sectionKey(module.key, section.key)"
        variant="catalog"
        :title="section.title"
        :counter="String(section.items.length)"
        :open="openKeys.has(sectionKey(module.key, section.key))"
        @toggle="toggle(sectionKey(module.key, section.key))"
      >
        <ul class="elements-page__list">
          <li v-for="item in section.items" :key="item.key" class="elements-page__item">
            {{ item.text
            }}<template v-if="item.note"
              >{{ ' ' }}<em class="elements-page__note">{{ item.note }}</em></template
            >
          </li>
        </ul>
      </SectionCard>
    </template>
    <div class="elements-page__badge">{{ elements.solo.badge }}</div>
    <SectionCard
      variant="catalog"
      :title="elements.solo.title"
      :counter="String(elements.solo.rows.length)"
      :open="openKeys.has(SOLO_KEY)"
      @toggle="toggle(SOLO_KEY)"
    >
      <div class="elements-page__table-wrap">
        <table class="elements-page__table">
          <thead>
            <tr>
              <th v-for="column in elements.solo.columns" :key="column">{{ column }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in elements.solo.rows" :key="row.key">
              <td class="elements-page__num">{{ row.num }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.module }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </SectionCard>
  </section>
</template>

<style scoped src="./ElementsPage.css"></style>
