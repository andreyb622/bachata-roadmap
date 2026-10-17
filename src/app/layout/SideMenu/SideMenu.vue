<script setup lang="ts">
import { useId } from 'vue';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/shared/composables/useOverlay';
import { APP_VERSION_LABEL } from '@/shared/config/app-meta';
import { ROUTE_NAMES } from '@/shared/config/route-names';

export type MenuAction = 'entities' | 'create' | 'info' | 'settings' | 'reset';

const emit = defineEmits<{ select: [action: MenuAction] }>();

const { t } = useI18n();

const open = defineModel<boolean>('open', { default: false });

const titleId = useId();

function close(): void {
  open.value = false;
}

const { isTopmost } = useOverlay(open, close);

function onBackdropClick(): void {
  if (isTopmost.value) close();
}

function select(action: MenuAction): void {
  close();
  emit('select', action);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="side-menu-fade">
      <div
        v-if="open"
        class="side-menu__backdrop"
        data-test="menu-backdrop"
        @click.self="onBackdropClick"
      ></div>
    </Transition>
    <Transition name="side-menu-slide">
      <aside
        v-if="open"
        class="side-menu"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div class="side-menu__header">
          <h2 :id="titleId" class="side-menu__title">{{ t('shell.menu') }}</h2>
          <button
            type="button"
            class="side-menu__close"
            :aria-label="t('ui.close')"
            data-test="menu-close"
            @click="close"
          >
            ✕
          </button>
        </div>
        <nav class="side-menu__nav">
          <button
            type="button"
            class="side-menu__item"
            data-test="menu-entities"
            @click="select('entities')"
          >
            <span class="side-menu__icon">👥</span>
            <span class="side-menu__label">{{ t('profiles.entities.title') }}</span>
          </button>
          <button
            type="button"
            class="side-menu__item"
            data-test="menu-create"
            @click="select('create')"
          >
            <span class="side-menu__icon">＋</span>
            <span class="side-menu__label">{{ t('profiles.form.createTitle') }}</span>
          </button>
          <RouterLink :to="{ name: ROUTE_NAMES.elements }" class="side-menu__item" @click="close">
            <span class="side-menu__icon">📑</span>
            <span class="side-menu__label">{{ t('shell.elementsTitle') }}</span>
          </RouterLink>
          <button
            type="button"
            class="side-menu__item"
            data-test="menu-settings"
            @click="select('settings')"
          >
            <span class="side-menu__icon">⚙</span>
            <span class="side-menu__label">{{ t('settings.title') }}</span>
          </button>
          <button
            type="button"
            class="side-menu__item"
            data-test="menu-info"
            @click="select('info')"
          >
            <span class="side-menu__icon">ℹ</span>
            <span class="side-menu__label">{{ t('shell.about') }}</span>
          </button>
          <button
            type="button"
            class="side-menu__item side-menu__item--danger"
            data-test="menu-reset"
            @click="select('reset')"
          >
            <span class="side-menu__icon">↺</span>
            <span class="side-menu__label">{{ t('shell.resetProgress') }}</span>
          </button>
        </nav>
        <p class="side-menu__version" data-test="menu-version">{{ APP_VERSION_LABEL }}</p>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped src="./SideMenu.css"></style>
