<script setup lang="ts">
import { useId } from 'vue';
import { useOverlay } from '@/composables/useOverlay';
import { ROUTE_NAMES } from '@/router';

export type MenuAction = 'entities' | 'create' | 'info' | 'reset';

const emit = defineEmits<{ select: [action: MenuAction] }>();

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
          <h2 :id="titleId" class="side-menu__title">Меню</h2>
          <button
            type="button"
            class="side-menu__close"
            aria-label="Закрыть"
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
            <span class="side-menu__label">Ученики и группы</span>
          </button>
          <button
            type="button"
            class="side-menu__item"
            data-test="menu-create"
            @click="select('create')"
          >
            <span class="side-menu__icon">＋</span>
            <span class="side-menu__label">Новый ученик / группа</span>
          </button>
          <RouterLink :to="{ name: ROUTE_NAMES.elements }" class="side-menu__item" @click="close">
            <span class="side-menu__icon">📑</span>
            <span class="side-menu__label">Элементы по блокам</span>
          </RouterLink>
          <button
            type="button"
            class="side-menu__item"
            data-test="menu-info"
            @click="select('info')"
          >
            <span class="side-menu__icon">ℹ</span>
            <span class="side-menu__label">О приложении</span>
          </button>
          <button
            type="button"
            class="side-menu__item side-menu__item--danger"
            data-test="menu-reset"
            @click="select('reset')"
          >
            <span class="side-menu__icon">↺</span>
            <span class="side-menu__label">Сбросить прогресс</span>
          </button>
        </nav>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped src="./SideMenu.css"></style>
