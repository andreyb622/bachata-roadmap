<script setup lang="ts">
import { nextTick, onBeforeUnmount, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ visible: boolean }>();

const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();

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
    <i18n-t scope="global" keypath="pwa.installHint.text" tag="p" class="install-hint__text">
      <template #title
        ><strong>{{ t('pwa.installHint.title') }}</strong></template
      >
    </i18n-t>
    <button
      type="button"
      class="install-hint__close"
      :aria-label="t('ui.close')"
      data-test="install-hint-close"
      @click="emit('close')"
    >
      ✕
    </button>
  </div>
</template>

<style scoped src="./InstallHint.css"></style>
