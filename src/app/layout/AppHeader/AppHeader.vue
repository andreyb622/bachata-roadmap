<script setup lang="ts">
import { routeForTab } from '@/app/router';

const { variant } = defineProps<{
  title: string;
  subtitle: string;
  variant: 'main' | 'elements';
}>();

const emit = defineEmits<{ 'open-menu': [] }>();
</script>

<template>
  <header class="app-header" :class="{ 'app-header--elements': variant === 'elements' }">
    <RouterLink
      v-if="variant === 'elements'"
      :to="routeForTab(0)"
      class="app-header__btn"
      aria-label="Назад к программе"
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
      title="Меню"
      aria-label="Меню"
      @click="emit('open-menu')"
    >
      ☰
    </button>
  </header>
</template>

<style scoped src="./AppHeader.css"></style>
