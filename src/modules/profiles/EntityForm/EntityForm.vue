<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet.vue';
import { useToast } from '@/shared/composables/useToast';
import { ERROR_CODES } from '@/shared/lib/errors';
import { MAX_ENTITY_NAME_LEN } from '../storage';
import { routeForTab } from '@/shared/config/route-names';
import { useProfilesStore } from '../store';

const { entityId } = defineProps<{ entityId: string | null }>();

const open = defineModel<boolean>('open', { default: false });

const { t } = useI18n();
const store = useProfilesStore();
const router = useRouter();
const { show, showError } = useToast();

const inputId = useId();
const input = useTemplateRef<HTMLInputElement>('input');
const name = ref('');
let focusTimer: ReturnType<typeof setTimeout> | null = null;

const isEdit = computed(() => entityId !== null);
const title = computed(() =>
  isEdit.value ? t('profiles.form.editTitle') : t('profiles.form.createTitle'),
);
const submitLabel = computed(() =>
  isEdit.value ? t('profiles.form.save') : t('profiles.form.create'),
);

function close(): void {
  open.value = false;
}

function saveEdit(id: string, value: string): void {
  const result = store.updateEntity(id, value);
  if (!result.ok) {
    showError(result.code);
    return;
  }
  show(t('profiles.toast.renamed'));
  close();
}

function saveCreate(value: string): void {
  const result = store.createEntity(value);
  if (!result.ok) {
    showError(result.code);
    return;
  }
  show(t('profiles.toast.created', { name: value }));
  router.push(routeForTab(0));
  close();
}

function save(): void {
  const value = name.value.trim();
  if (!value) {
    showError(ERROR_CODES.ENTITY_NAME_REQUIRED);
    return;
  }
  if (value.length > MAX_ENTITY_NAME_LEN) {
    showError(ERROR_CODES.ENTITY_NAME_TOO_LONG, { context: { maxLen: MAX_ENTITY_NAME_LEN } });
    return;
  }
  if (entityId !== null) saveEdit(entityId, value);
  else saveCreate(value);
}

function clearFocusTimer(): void {
  if (focusTimer === null) return;
  clearTimeout(focusTimer);
  focusTimer = null;
}

watch(open, (isOpen) => {
  clearFocusTimer();
  if (!isOpen) return;
  const entity = store.entities.find((item) => item.id === entityId);
  name.value = entity?.name ?? '';
  focusTimer = setTimeout(() => {
    focusTimer = null;
    input.value?.focus();
    input.value?.select();
  }, 100);
});

onBeforeUnmount(clearFocusTimer);
</script>

<template>
  <BottomSheet v-model:open="open" :title="title">
    <form class="entity-form" @submit.prevent="save">
      <label class="entity-form__label" :for="inputId">{{ t('profiles.form.label') }}</label>
      <input
        :id="inputId"
        ref="input"
        v-model="name"
        class="entity-form__input"
        type="text"
        :maxlength="MAX_ENTITY_NAME_LEN"
        :placeholder="t('profiles.form.placeholder')"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        data-test="entity-input"
      />
      <div class="entity-form__actions">
        <button
          type="button"
          class="entity-form__button entity-form__button--secondary"
          data-test="entity-cancel"
          @click="close"
        >
          {{ t('ui.cancel') }}
        </button>
        <button
          type="submit"
          class="entity-form__button entity-form__button--primary"
          data-test="entity-submit"
        >
          {{ submitLabel }}
        </button>
      </div>
    </form>
  </BottomSheet>
</template>

<style scoped src="./EntityForm.css"></style>
