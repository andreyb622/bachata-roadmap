import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useToast } from '@/shared/composables/useToast';
import { PROGRAM, getAllItemIds } from '@/modules/program';
import { ERROR_CODES, getUserMessage } from '@/shared/lib/errors';
import type { ErrorCode } from '@/shared/lib/errors';
import {
  clearActiveProgress,
  consumeStorageError,
  createEntity as storageCreateEntity,
  deleteEntity as storageDeleteEntity,
  getActiveProgress,
  getEntities,
  getEntityById,
  getEntityProgressPct,
  getSavedTabIndex,
  getState,
  getStorageRecoveryMessage,
  initStorage,
  isStorageOk,
  setSavedTabIndex,
  switchEntity as storageSwitchEntity,
  toggleProgressItem,
  updateEntity as storageUpdateEntity,
} from './storage';
import type { StoredEntity } from './storage';

export type ActionResult<T = void> = { ok: true; value: T } | { ok: false; code: ErrorCode };

export interface StartupMessage {
  message: string;
  duration: number;
}

const ALL_ITEM_IDS = getAllItemIds(PROGRAM);

function ok<T>(value: T): ActionResult<T> {
  return { ok: true, value };
}

function fail<T>(code: ErrorCode): ActionResult<T> {
  return { ok: false, code };
}

export const useProfilesStore = defineStore('profiles', () => {
  initStorage();

  function readStartupMessage(): StartupMessage | null {
    const recoveryMessage = getStorageRecoveryMessage();
    if (recoveryMessage) return { message: recoveryMessage, duration: 4000 };
    if (!isStorageOk()) {
      return { message: getUserMessage(ERROR_CODES.STORAGE_UNAVAILABLE), duration: 3500 };
    }
    return null;
  }

  let startupMessage = readStartupMessage();

  const entities = ref<StoredEntity[]>([]);
  const activeEntityId = ref<string | null>(null);
  const activeProgress = ref<Record<string, true>>({});
  const savedTab = ref(0);
  const entityPercents = ref<Record<string, number>>({});

  const activeEntity = computed(
    () => entities.value.find((entity) => entity.id === activeEntityId.value) ?? null,
  );

  function sync(): void {
    entities.value = getEntities().map((entity) => ({ ...entity }));
    activeEntityId.value = getState().activeId;
    activeProgress.value = { ...getActiveProgress() };
    savedTab.value = getSavedTabIndex() ?? 0;
    entityPercents.value = Object.fromEntries(
      entities.value.map((entity) => [entity.id, getEntityProgressPct(entity.id, ALL_ITEM_IDS)]),
    );
  }

  function reportStorageError(): void {
    const code = consumeStorageError();
    if (code) useToast().showError(code);
  }

  function finish<T>(result: ActionResult<T>): ActionResult<T> {
    sync();
    reportStorageError();
    return result;
  }

  sync();

  function toggleItem(id: string): ActionResult<boolean> {
    return finish(ok(toggleProgressItem(id)));
  }

  function clearProgress(): ActionResult {
    clearActiveProgress();
    return finish(ok(undefined));
  }

  function createEntity(name: string): ActionResult<StoredEntity> {
    const entity = storageCreateEntity(name);
    if (!entity) return finish(fail(ERROR_CODES.ENTITY_CREATE_FAILED));
    return finish(ok({ ...entity }));
  }

  function updateEntity(id: string, name: string): ActionResult<StoredEntity> {
    const entity = storageUpdateEntity(id, name);
    if (!entity) return finish(fail(ERROR_CODES.ENTITY_UPDATE_FAILED));
    return finish(ok({ ...entity }));
  }

  function deleteEntity(id: string): ActionResult<{ entity: StoredEntity; wasActive: boolean }> {
    if (entities.value.length <= 1) return fail(ERROR_CODES.ENTITY_DELETE_LAST);
    if (!getEntityById(id)) return fail(ERROR_CODES.ENTITY_NOT_FOUND);
    const result = storageDeleteEntity(id);
    if (!result) return finish(fail(ERROR_CODES.ENTITY_DELETE_FAILED));
    return finish(ok({ entity: { ...result.entity }, wasActive: result.wasActive }));
  }

  function switchEntity(id: string): ActionResult<StoredEntity> {
    if (id === activeEntityId.value) {
      const active = getEntityById(id);
      return active ? ok({ ...active }) : fail(ERROR_CODES.ENTITY_SWITCH_FAILED);
    }
    const entity = storageSwitchEntity(id);
    if (!entity) return finish(fail(ERROR_CODES.ENTITY_SWITCH_FAILED));
    return finish(ok({ ...entity }));
  }

  function setTab(index: number): void {
    setSavedTabIndex(index);
    sync();
    reportStorageError();
  }

  function consumeStartupMessage(): StartupMessage | null {
    const message = startupMessage;
    startupMessage = null;
    return message;
  }

  return {
    entities,
    activeEntityId,
    activeProgress,
    savedTab,
    entityPercents,
    activeEntity,
    toggleItem,
    clearProgress,
    createEntity,
    updateEntity,
    deleteEntity,
    switchEntity,
    setTab,
    consumeStartupMessage,
  };
});
