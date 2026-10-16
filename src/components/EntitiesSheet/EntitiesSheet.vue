<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import BottomSheet from '@/components/BottomSheet/BottomSheet.vue';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog.vue';
import { useToast } from '@/composables/useToast';
import { ERROR_CODES } from '@/lib/errors';
import { DEFAULT_ENTITY_NAME } from '@/lib/storage';
import { routeForTab } from '@/router';
import { useProfilesStore } from '@/stores/useProfilesStore';

const emit = defineEmits<{ edit: [id: string] }>();

const open = defineModel<boolean>('open', { default: false });

const store = useProfilesStore();
const router = useRouter();
const { show, showError } = useToast();

const isDeleteOpen = ref(false);
const deleteId = ref<string | null>(null);
const deleteMessage = ref('');

function close(): void {
  open.value = false;
}

function switchTo(id: string): void {
  if (id === store.activeEntityId) {
    close();
    return;
  }
  const result = store.switchEntity(id);
  if (!result.ok) {
    showError(result.code);
    return;
  }
  router.push(routeForTab(store.savedTab));
  close();
  show(`Выбрано: ${result.value.name ?? DEFAULT_ENTITY_NAME}`);
}

function askDelete(id: string): void {
  if (store.entities.length <= 1) {
    showError(ERROR_CODES.ENTITY_DELETE_LAST);
    return;
  }
  const entity = store.entities.find((item) => item.id === id);
  if (!entity) {
    showError(ERROR_CODES.ENTITY_NOT_FOUND);
    return;
  }
  deleteId.value = id;
  deleteMessage.value = `Удалить «${entity.name ?? DEFAULT_ENTITY_NAME}»? Прогресс будет потерян.`;
  isDeleteOpen.value = true;
}

function confirmDelete(): void {
  const id = deleteId.value;
  if (id === null) return;
  const result = store.deleteEntity(id);
  if (!result.ok) {
    showError(result.code);
    return;
  }
  show(`Удалено: ${result.value.entity.name ?? 'запись'}`);
  if (result.value.wasActive) router.push(routeForTab(store.savedTab));
}
</script>

<template>
  <BottomSheet v-model:open="open" title="Ученики и группы">
    <div
      v-if="store.entities.length === 0"
      class="entities-sheet__empty"
      data-test="entities-empty"
    >
      Пока никого нет.<br />Откройте меню <strong>☰</strong> и нажмите «Новый ученик / группа».
    </div>
    <div v-else class="entities-sheet__list">
      <div
        v-for="entity in store.entities"
        :key="entity.id"
        class="entities-sheet__item"
        :class="{ 'entities-sheet__item--active': entity.id === store.activeEntityId }"
        data-test="entity-row"
      >
        <button
          type="button"
          class="entities-sheet__main"
          data-test="entity-switch"
          @click="switchTo(entity.id)"
        >
          <span class="entities-sheet__name">{{ entity.name ?? DEFAULT_ENTITY_NAME }}</span>
          <span class="entities-sheet__percent">{{ store.entityPercents[entity.id] ?? 0 }}%</span>
          <span v-if="entity.id === store.activeEntityId" class="entities-sheet__badge"
            >активен</span
          >
        </button>
        <div class="entities-sheet__actions">
          <button
            type="button"
            class="entities-sheet__action"
            title="Редактировать"
            aria-label="Редактировать"
            data-test="entity-edit"
            @click="emit('edit', entity.id)"
          >
            ✏
          </button>
          <button
            type="button"
            class="entities-sheet__action entities-sheet__action--danger"
            title="Удалить"
            aria-label="Удалить"
            data-test="entity-delete"
            @click="askDelete(entity.id)"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  </BottomSheet>
  <ConfirmDialog
    v-model:open="isDeleteOpen"
    :message="deleteMessage"
    confirm-label="Удалить"
    @confirm="confirmDelete"
  />
</template>

<style scoped src="./EntitiesSheet.css"></style>
