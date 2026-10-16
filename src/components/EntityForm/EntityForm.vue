<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import BottomSheet from '@/components/BottomSheet/BottomSheet.vue';
import { useToast } from '@/composables/useToast';
import { ERROR_CODES } from '@/lib/errors';
import { MAX_ENTITY_NAME_LEN } from '@/lib/storage';
import { routeForTab } from '@/router';
import { useProfilesStore } from '@/stores/useProfilesStore';

const { entityId } = defineProps<{ entityId: string | null }>();

const open = defineModel<boolean>('open', { default: false });

const store = useProfilesStore();
const router = useRouter();
const { show, showError } = useToast();

const inputId = useId();
const input = useTemplateRef<HTMLInputElement>('input');
const name = ref('');
let focusTimer: ReturnType<typeof setTimeout> | null = null;

const isEdit = computed(() => entityId !== null);
const title = computed(() => (isEdit.value ? 'Редактировать' : 'Новый ученик / группа'));
const submitLabel = computed(() => (isEdit.value ? 'Сохранить' : 'Создать'));

function close(): void {
  open.value = false;
}

function saveEdit(id: string, value: string): void {
  const result = store.updateEntity(id, value);
  if (!result.ok) {
    showError(result.code);
    return;
  }
  show('Имя обновлено');
  close();
}

function saveCreate(value: string): void {
  const result = store.createEntity(value);
  if (!result.ok) {
    showError(result.code);
    return;
  }
  show(`Создано: ${value}`);
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
      <label class="entity-form__label" :for="inputId">Имя или название группы</label>
      <input
        :id="inputId"
        ref="input"
        v-model="name"
        class="entity-form__input"
        type="text"
        :maxlength="MAX_ENTITY_NAME_LEN"
        placeholder="Например: Маша или Группа А"
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
          Отмена
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
