<script setup lang="ts">
import { useRoute } from 'vue-router';
import { PROGRAM } from '@/data/program';

const route = useRoute();
</script>

<template>
  <section class="program-page">
    <h1 class="program-page__title">{{ PROGRAM[Number(route.params.period)]?.name }}</h1>
  </section>
</template>

<style scoped src="./ProgramPage.css"></style>
