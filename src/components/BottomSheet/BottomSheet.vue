<script setup lang="ts">
import { nextTick, useId, useTemplateRef, watch } from 'vue';
import { useOverlay } from '@/composables/useOverlay';

const { title, zLayer = 'sheet' } = defineProps<{
  title: string;
  zLayer?: 'sheet' | 'dialog';
}>();

const open = defineModel<boolean>('open', { default: false });

const titleId = useId();
const panel = useTemplateRef<HTMLElement>('panel');

function close(): void {
  open.value = false;
}

const { isTopmost } = useOverlay(open, close);

function onBackdropClick(): void {
  if (isTopmost.value) close();
}

watch(open, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();
  const element = panel.value;
  if (element && !element.contains(document.activeElement)) element.focus();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="bottom-sheet-fade">
      <div
        v-if="open"
        class="bottom-sheet__backdrop"
        :class="{ 'bottom-sheet__backdrop--dialog': zLayer === 'dialog' }"
        data-test="sheet-backdrop"
        @click.self="onBackdropClick"
      ></div>
    </Transition>
    <Transition name="bottom-sheet-slide">
      <div
        v-if="open"
        ref="panel"
        class="bottom-sheet"
        :class="{ 'bottom-sheet--dialog': zLayer === 'dialog' }"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
      >
        <div class="bottom-sheet__header">
          <h2 :id="titleId" class="bottom-sheet__title">{{ title }}</h2>
          <button
            type="button"
            class="bottom-sheet__close"
            aria-label="Закрыть"
            data-test="sheet-close"
            @click="close"
          >
            ✕
          </button>
        </div>
        <slot></slot>
        <div v-if="$slots.footer" class="bottom-sheet__footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped src="./BottomSheet.css"></style>
