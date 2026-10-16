<script setup lang="ts">
import { useId } from 'vue';

interface Props {
  title: string;
  counter?: string;
  open: boolean;
  variant?: 'catalog';
}

defineProps<Props>();

const emit = defineEmits<{ toggle: [] }>();

const bodyId = useId();
</script>

<template>
  <section class="section-card" :class="{ 'section-card--catalog': variant === 'catalog' }">
    <button
      type="button"
      class="section-card__header"
      data-test="section-header"
      :aria-expanded="open"
      :aria-controls="bodyId"
      @click="emit('toggle')"
    >
      <span class="section-card__title">{{ title }}</span>
      <span v-if="counter !== undefined" class="section-card__count" data-test="section-count">{{
        counter
      }}</span>
      <span class="section-card__chevron" aria-hidden="true">▼</span>
    </button>
    <div v-show="open" :id="bodyId" class="section-card__body" data-test="section-body">
      <slot />
    </div>
  </section>
</template>

<style scoped src="./SectionCard.css"></style>
