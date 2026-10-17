<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { PROGRAM } from '@/modules/program';
import {
  buildSearchIndex,
  getHighlightSegments,
  normalizeText,
  searchItems,
} from '@/modules/search';
import type { SearchEntry } from '@/modules/search';
import { ROUTE_NAMES } from '@/shared/config/route-names';

const DEBOUNCE_MS = 120;

const { t, locale } = useI18n();
const router = useRouter();
const inputRef = useTemplateRef<HTMLInputElement>('input');

const inputValue = ref('');
const query = ref('');
const index = computed(() => buildSearchIndex(PROGRAM, locale.value));

const updateQuery = useDebounceFn((value: string) => {
  query.value = value;
}, DEBOUNCE_MS);
watch(inputValue, updateQuery);

const results = computed(() => searchItems(index.value, query.value, locale.value));
const hasQuery = computed(() => normalizeText(query.value, locale.value) !== '');

onMounted(() => inputRef.value?.focus());

function openResult(entry: SearchEntry): void {
  inputValue.value = '';
  query.value = '';
  router.push({
    name: ROUTE_NAMES.program,
    params: { period: String(entry.periodId) },
    query: { item: entry.id },
  });
}
</script>

<template>
  <section class="search-page">
    <h1 class="search-page__title">{{ t('search.title') }}</h1>
    <div class="search-page__field">
      <span class="search-page__icon" aria-hidden="true">🔍</span>
      <input
        ref="input"
        v-model="inputValue"
        class="search-page__input"
        type="search"
        :placeholder="t('search.placeholder')"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        :aria-label="t('search.title')"
        data-test="search-input"
      />
    </div>
    <p v-if="hasQuery && results.length === 0" class="search-page__empty" data-test="search-empty">
      {{ t('search.empty') }}
    </p>
    <ul v-else-if="results.length > 0" class="search-page__results">
      <li v-for="entry in results" :key="entry.id">
        <button
          type="button"
          class="search-result"
          data-test="search-result"
          @click="openResult(entry)"
        >
          <span class="search-result__period"
            >{{ entry.periodName }} · {{ entry.sectionTitle }}</span
          >
          <span class="search-result__text">
            <template
              v-for="(segment, segmentIndex) in getHighlightSegments(entry.text, query, locale)"
              :key="segmentIndex"
            >
              <mark v-if="segment.isMatch" class="search-result__mark">{{ segment.text }}</mark>
              <template v-else>{{ segment.text }}</template>
            </template>
          </span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped src="./SearchPage.css"></style>
