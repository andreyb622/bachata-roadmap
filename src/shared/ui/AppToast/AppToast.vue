<script setup lang="ts">
import { useToast } from '@/shared/composables/useToast';

const { current } = useToast();
</script>

<template>
  <Teleport to="body">
    <Transition name="app-toast">
      <div v-if="current" class="app-toast" role="status" aria-live="polite">{{ current }}</div>
    </Transition>
  </Teleport>
</template>

<style scoped src="./AppToast.css"></style>
