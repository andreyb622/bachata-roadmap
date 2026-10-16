<script setup lang="ts">
import { ref } from 'vue';
import SectionCard from '@/components/SectionCard/SectionCard.vue';
import { ELEMENT_MODULES, ELEMENTS_PAGE, SOLO_ELEMENTS_TABLE } from '@/data/elements';

const SOLO_KEY = 'solo';

const sectionKey = (moduleIndex: number, sectionIndex: number) =>
  `m${moduleIndex}-s${sectionIndex}`;

const openKeys = ref<Set<string>>(
  new Set([...ELEMENT_MODULES.map((_, moduleIndex) => sectionKey(moduleIndex, 0)), SOLO_KEY]),
);

function toggle(key: string) {
  const next = new Set(openKeys.value);
  if (!next.delete(key)) next.add(key);
  openKeys.value = next;
}
</script>

<template>
  <section class="elements-page">
    <p class="elements-page__intro">{{ ELEMENTS_PAGE.intro }}</p>
    <template v-for="(module, moduleIndex) in ELEMENT_MODULES" :key="module.title">
      <div class="elements-page__badge">{{ module.title }}</div>
      <SectionCard
        v-for="(section, sectionIndex) in module.sections"
        :key="sectionKey(moduleIndex, sectionIndex)"
        variant="catalog"
        :title="section.title"
        :counter="String(section.items.length)"
        :open="openKeys.has(sectionKey(moduleIndex, sectionIndex))"
        @toggle="toggle(sectionKey(moduleIndex, sectionIndex))"
      >
        <ul class="elements-page__list">
          <li
            v-for="(item, itemIndex) in section.items"
            :key="itemIndex"
            class="elements-page__item"
          >
            {{ item.text
            }}<template v-if="'note' in item"
              >{{ ' ' }}<em class="elements-page__note">{{ item.note }}</em></template
            >
          </li>
        </ul>
      </SectionCard>
    </template>
    <div class="elements-page__badge">{{ SOLO_ELEMENTS_TABLE.badge }}</div>
    <SectionCard
      variant="catalog"
      :title="SOLO_ELEMENTS_TABLE.title"
      :counter="String(SOLO_ELEMENTS_TABLE.rows.length)"
      :open="openKeys.has(SOLO_KEY)"
      @toggle="toggle(SOLO_KEY)"
    >
      <div class="elements-page__table-wrap">
        <table class="elements-page__table">
          <thead>
            <tr>
              <th v-for="column in SOLO_ELEMENTS_TABLE.columns" :key="column">{{ column }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in SOLO_ELEMENTS_TABLE.rows" :key="row.num">
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
