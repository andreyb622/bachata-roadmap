<script setup lang="ts">
import BottomSheet from '@/components/BottomSheet/BottomSheet.vue';

defineProps<{
  message: string;
  confirmLabel: string;
}>();

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
        Отмена
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
