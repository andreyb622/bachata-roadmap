<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet.vue';

defineProps<{
  message: string;
  confirmLabel: string;
}>();

const { t } = useI18n();

const emit = defineEmits<{ confirm: [] }>();

const open = defineModel<boolean>('open', { default: false });

function cancel(): void {
  open.value = false;
}

function confirm(): void {
  emit('confirm');
  open.value = false;
}
</script>

<template>
  <BottomSheet v-model:open="open" :title="message" z-layer="dialog">
    <template #footer>
      <button
        type="button"
        class="confirm-dialog__button confirm-dialog__button--secondary"
        data-test="confirm-cancel"
        @click="cancel"
      >
        {{ t('ui.cancel') }}
      </button>
      <button
        type="button"
        class="confirm-dialog__button confirm-dialog__button--danger"
        data-test="confirm-accept"
        @click="confirm"
      >
        {{ confirmLabel }}
      </button>
    </template>
  </BottomSheet>
</template>

<style scoped src="./ConfirmDialog.css"></style>
