<script setup lang="ts">
import { useId } from 'vue';

interface Props {
  percent: number;
}

defineProps<Props>();

const labelId = useId();
</script>

<template>
  <div class="progress-bar">
    <div class="progress-bar__label">
      <span :id="labelId">Прогресс</span>
      <span class="progress-bar__percent" data-test="progress-percent">{{ percent }}%</span>
    </div>
    <progress class="progress-bar__track" max="100" :value="percent" :aria-labelledby="labelId" />
  </div>
</template>

<style scoped src="./ProgressBar.css"></style>
