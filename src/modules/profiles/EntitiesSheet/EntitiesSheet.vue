<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import BottomSheet from '@/shared/ui/BottomSheet/BottomSheet.vue';
import ConfirmDialog from '@/shared/ui/ConfirmDialog/ConfirmDialog.vue';
import { useToast } from '@/shared/composables/useToast';
import { ERROR_CODES } from '@/shared/lib/errors';
import { DEFAULT_ENTITY_NAME } from '../storage';
import { routeForTab } from '@/shared/config/route-names';
import { useProfilesStore } from '../store';

const emit = defineEmits<{ edit: [id: string] }>();

const open = defineModel<boolean>('open', { default: false });

const { t } = useI18n();
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
  show(t('profiles.toast.selected', { name: result.value.name ?? DEFAULT_ENTITY_NAME }));
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
  deleteMessage.value = t('profiles.confirm.delete', {
    name: entity.name ?? DEFAULT_ENTITY_NAME,
  });
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
  show(
    t('profiles.toast.deleted', {
      name: result.value.entity.name ?? t('profiles.toast.deletedFallback'),
    }),
  );
  if (result.value.wasActive) router.push(routeForTab(store.savedTab));
}
</script>

<template>
  <BottomSheet v-model:open="open" :title="t('profiles.entities.title')">
    <i18n-t
      v-if="store.entities.length === 0"
      scope="global"
      keypath="profiles.entities.empty"
      tag="div"
      class="entities-sheet__empty"
      data-test="entities-empty"
    >
      <template #br><br /></template>
      <template #icon><strong>☰</strong></template>
    </i18n-t>
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
          <span v-if="entity.id === store.activeEntityId" class="entities-sheet__badge">{{
            t('profiles.entities.active')
          }}</span>
        </button>
        <div class="entities-sheet__actions">
          <button
            type="button"
            class="entities-sheet__action"
            :title="t('profiles.entities.edit')"
            :aria-label="t('profiles.entities.edit')"
            data-test="entity-edit"
            @click="emit('edit', entity.id)"
          >
            ✏
          </button>
          <button
            type="button"
            class="entities-sheet__action entities-sheet__action--danger"
            :title="t('profiles.entities.delete')"
            :aria-label="t('profiles.entities.delete')"
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
    :confirm-label="t('profiles.confirm.deleteAction')"
    @confirm="confirmDelete"
  />
</template>

<style scoped src="./EntitiesSheet.css"></style>
