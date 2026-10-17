<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet.vue';

const ELEMENT_MODULES_COUNT = 5;

const { t } = useI18n();

const open = defineModel<boolean>('open', { default: false });
</script>

<template>
  <BottomSheet v-model:open="open" :title="t('shell.about')">
    <div class="info-sheet">
      <div class="info-sheet__block">
        <div class="info-sheet__block-title">{{ t('shell.info.what.title') }}</div>
        <i18n-t
          scope="global"
          keypath="shell.info.what.text"
          tag="p"
          class="info-sheet__block-text"
        >
          <template #name
            ><strong>{{ t('app.name') }}</strong></template
          >
        </i18n-t>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">{{ t('shell.info.tabs.title') }}</div>
        <ul class="info-sheet__block-list">
          <i18n-t scope="global" keypath="shell.info.tabs.program" tag="li">
            <template #label
              ><strong>{{ t('shell.info.tabs.programLabel') }}</strong></template
            >
          </i18n-t>
          <i18n-t scope="global" keypath="shell.info.tabs.search" tag="li">
            <template #label
              ><strong>{{ t('search.title') }}</strong></template
            >
          </i18n-t>
          <i18n-t scope="global" keypath="shell.info.tabs.elements" tag="li">
            <template #label
              ><strong>{{ t('shell.info.tabs.elementsLabel') }}</strong></template
            >
            <template #modules>{{ t('shell.info.tabs.modules', ELEMENT_MODULES_COUNT) }}</template>
          </i18n-t>
        </ul>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">{{ t('shell.info.checklists.title') }}</div>
        <ul class="info-sheet__block-list">
          <li>{{ t('shell.info.checklists.tap') }}</li>
          <li>{{ t('shell.info.checklists.untap') }}</li>
          <i18n-t scope="global" keypath="shell.info.checklists.bar" tag="li">
            <template #label
              ><strong>{{ t('shell.info.checklists.barLabel') }}</strong></template
            >
          </i18n-t>
          <i18n-t scope="global" keypath="shell.info.checklists.counter" tag="li">
            <template #label
              ><strong>{{ t('shell.info.checklists.counterLabel') }}</strong></template
            >
          </i18n-t>
        </ul>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">{{ t('shell.info.sections.title') }}</div>
        <p class="info-sheet__block-text">{{ t('shell.info.sections.text') }}</p>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">{{ t('shell.info.search.title') }}</div>
        <p class="info-sheet__block-text">{{ t('shell.info.search.text') }}</p>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">{{ t('shell.info.profiles.title') }}</div>
        <ul class="info-sheet__block-list">
          <i18n-t scope="global" keypath="shell.info.profiles.menu" tag="li">
            <template #icon><strong>☰</strong></template>
          </i18n-t>
          <i18n-t scope="global" keypath="shell.info.profiles.switch" tag="li">
            <template #label
              ><strong>{{ t('profiles.entities.title') }}</strong></template
            >
          </i18n-t>
          <i18n-t scope="global" keypath="shell.info.profiles.create" tag="li">
            <template #label
              ><strong>{{ t('profiles.form.createTitle') }}</strong></template
            >
          </i18n-t>
          <li>{{ t('shell.info.profiles.name') }}</li>
          <li>{{ t('shell.info.profiles.own') }}</li>
        </ul>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">{{ t('shell.info.saving.title') }}</div>
        <ul class="info-sheet__block-list">
          <li>{{ t('shell.info.saving.auto') }}</li>
          <li>{{ t('shell.info.saving.offline') }}</li>
          <li>{{ t('shell.info.saving.backup') }}</li>
          <i18n-t scope="global" keypath="shell.info.saving.update" tag="li">
            <template #label
              ><strong>{{ t('shell.info.saving.updateLabel') }}</strong></template
            >
          </i18n-t>
        </ul>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">{{ t('shell.info.updates.title') }}</div>
        <p class="info-sheet__block-text">{{ t('shell.info.updates.text') }}</p>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">{{ t('shell.info.problems.title') }}</div>
        <ul class="info-sheet__block-list">
          <li>{{ t('shell.info.problems.message') }}</li>
          <li>{{ t('shell.info.problems.corrupted') }}</li>
          <li>{{ t('shell.info.problems.unavailable') }}</li>
          <li>{{ t('shell.info.problems.space') }}</li>
        </ul>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">{{ t('shell.info.install.title') }}</div>
        <i18n-t
          scope="global"
          keypath="shell.info.install.text"
          tag="p"
          class="info-sheet__block-text"
        >
          <template #label><strong>Safari</strong></template>
        </i18n-t>
      </div>

      <div class="info-sheet__block">
        <div class="info-sheet__block-title">{{ t('shell.info.reset.title') }}</div>
        <i18n-t
          scope="global"
          keypath="shell.info.reset.text"
          tag="p"
          class="info-sheet__block-text"
        >
          <template #icon><strong>↺</strong></template>
          <template #label
            ><strong>{{ t('shell.info.reset.labelCurrent') }}</strong></template
          >
        </i18n-t>
      </div>
    </div>
  </BottomSheet>
</template>

<style scoped src="./InfoSheet.css"></style>
