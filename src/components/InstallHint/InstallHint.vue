<script setup lang="ts">
import { nextTick, onBeforeUnmount, useTemplateRef, watch } from 'vue';

const props = defineProps<{ visible: boolean }>();

const emit = defineEmits<{ close: [] }>();

const rootRef = useTemplateRef<HTMLElement>('root');

const HTML_CLASS = 'install-hint-visible';
const HEIGHT_VAR = '--install-hint-h';

function clearOffset(): void {
  document.documentElement.classList.remove(HTML_CLASS);
  document.documentElement.style.removeProperty(HEIGHT_VAR);
}

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) {
      clearOffset();
      return;
    }
    await nextTick();
    if (!props.visible || !rootRef.value) return;
    const height = rootRef.value.offsetHeight;
    if (height > 0) {
      document.documentElement.style.setProperty(HEIGHT_VAR, `${height}px`);
    }
    document.documentElement.classList.add(HTML_CLASS);
  },
  { immediate: true },
);

onBeforeUnmount(clearOffset);
</script>

<template>
  <div v-if="visible" ref="root" class="install-hint">
    <p class="install-hint__text">
      <strong>Установить как приложение:</strong> Safari → Поделиться → «На экран «Домой»». Работает
      офлайн после первого открытия.
    </p>
    <button
      type="button"
      class="install-hint__close"
      aria-label="Закрыть"
      data-test="install-hint-close"
      @click="emit('close')"
    >
      ✕
    </button>
  </div>
</template>

<style scoped src="./InstallHint.css"></style>
