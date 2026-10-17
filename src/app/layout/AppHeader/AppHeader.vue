<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { routeForTab } from '@/app/router';

const { variant } = defineProps<{
  title: string;
  subtitle: string;
  variant: 'main' | 'elements';
}>();

const { t } = useI18n();

const emit = defineEmits<{ 'open-menu': [] }>();
</script>

<template>
  <header class="app-header" :class="{ 'app-header--elements': variant === 'elements' }">
    <RouterLink
      v-if="variant === 'elements'"
      :to="routeForTab(0)"
      class="app-header__btn"
      :aria-label="t('shell.back')"
      data-test="header-back"
      >←</RouterLink
    >
    <div class="app-header__text">
      <div class="app-header__title">{{ title }}</div>
      <div class="app-header__subtitle">{{ subtitle }}</div>
    </div>
    <button
      v-if="variant === 'main'"
      type="button"
      class="app-header__btn"
      :title="t('shell.menu')"
      :aria-label="t('shell.menu')"
      @click="emit('open-menu')"
    >
      ☰
    </button>
  </header>
</template>

<style scoped src="./AppHeader.css"></style>
