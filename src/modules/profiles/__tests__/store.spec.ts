import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useToast } from '@/shared/composables/useToast';
import { ERROR_CODES, getUserMessage } from '@/shared/lib/errors';
import { PROGRAM, getAllItemIds } from '@/modules/program';
import { STATE_KEY, getEntityProgressPct } from '../storage';
import { useProfilesStore } from '../store';

function freshStore() {
  setActivePinia(createPinia());
  return useProfilesStore();
}

beforeEach(() => {
  localStorage.clear();
  useToast().clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  useToast().clear();
});

describe('useProfilesStore', () => {
  it('starts with one default entity, empty progress and tab 0', () => {
    const store = freshStore();
    expect(store.entities).toHaveLength(1);
    expect(store.activeEntity?.name).toBe('Мой прогресс');
    expect(store.activeProgress).toEqual({});
    expect(store.savedTab).toBe(0);
  });

  it('toggleItem sets an id', () => {
    const store = freshStore();
    expect(store.toggleItem('0-0-0')).toEqual({ ok: true, value: true });
    expect(store.activeProgress['0-0-0']).toBe(true);
  });

  it('toggleItem unsets an id on the second call', () => {
    const store = freshStore();
    store.toggleItem('0-0-0');
    expect(store.toggleItem('0-0-0')).toEqual({ ok: true, value: false });
    expect(store.activeProgress['0-0-0']).toBeUndefined();
  });

  it('toggleItem updates entityPercents', () => {
    const store = freshStore();
    const id = store.activeEntityId ?? '';
    store.toggleItem('0-0-0');
    expect(store.entityPercents[id]).toBe(getEntityProgressPct(id, getAllItemIds(PROGRAM)));
  });

  it('clearProgress empties progress', () => {
    const store = freshStore();
    store.toggleItem('0-0-0');
    expect(store.clearProgress().ok).toBe(true);
    expect(store.activeProgress).toEqual({});
  });

  it('createEntity trims the name and activates the entity', () => {
    const store = freshStore();
    const result = store.createEntity('  Анна  ');
    expect(result.ok).toBe(true);
    expect(store.entities).toHaveLength(2);
    expect(store.activeEntity?.name).toBe('Анна');
  });

  it('createEntity with a blank name fails', () => {
    const store = freshStore();
    expect(store.createEntity('   ')).toEqual({
      ok: false,
      code: ERROR_CODES.ENTITY_CREATE_FAILED,
    });
  });

  it('updateEntity renames the entity', () => {
    const store = freshStore();
    const id = store.activeEntityId ?? '';
    expect(store.updateEntity(id, 'Новое').ok).toBe(true);
    expect(store.entities[0]?.name).toBe('Новое');
    expect(store.activeEntity?.name).toBe('Новое');
  });

  it('deleteEntity refuses to delete the last entity', () => {
    const store = freshStore();
    const id = store.activeEntityId ?? '';
    expect(store.deleteEntity(id)).toEqual({ ok: false, code: ERROR_CODES.ENTITY_DELETE_LAST });
  });

  it('deleteEntity reports an unknown id', () => {
    const store = freshStore();
    store.createEntity('Борис');
    expect(store.deleteEntity('nope')).toEqual({ ok: false, code: ERROR_CODES.ENTITY_NOT_FOUND });
  });

  it('deleting the active entity switches to the first one', () => {
    const store = freshStore();
    const firstId = store.activeEntityId ?? '';
    store.createEntity('Борис');
    const result = store.deleteEntity(store.activeEntityId ?? '');
    expect(result.ok && result.value.wasActive).toBe(true);
    expect(store.activeEntityId).toBe(firstId);
  });

  it('switchEntity changes the active progress', () => {
    const store = freshStore();
    const firstId = store.activeEntityId ?? '';
    store.toggleItem('0-0-0');
    store.createEntity('Борис');
    expect(store.activeProgress).toEqual({});
    expect(store.switchEntity(firstId).ok).toBe(true);
    expect(store.activeProgress['0-0-0']).toBe(true);
  });

  it('switching to the active id is an ok no-op', () => {
    const store = freshStore();
    const id = store.activeEntityId ?? '';
    const result = store.switchEntity(id);
    expect(result.ok && result.value.id).toBe(id);
    expect(useToast().current.value).toBeNull();
  });

  it('switching to an unknown id fails', () => {
    const store = freshStore();
    expect(store.switchEntity('nope')).toEqual({
      ok: false,
      code: ERROR_CODES.ENTITY_SWITCH_FAILED,
    });
  });

  it('setTab persists across stores', () => {
    freshStore().setTab(2);
    expect(freshStore().savedTab).toBe(2);
  });

  it('consumeStartupMessage is null on a clean start', () => {
    expect(freshStore().consumeStartupMessage()).toBeNull();
  });

  it('consumeStartupMessage returns the recovery message once', () => {
    localStorage.setItem(STATE_KEY, '{bad');
    const store = freshStore();
    expect(store.consumeStartupMessage()).toEqual({
      message: getUserMessage(ERROR_CODES.STORAGE_NEW_PROFILE_PARSE),
      duration: 4000,
    });
    expect(store.consumeStartupMessage()).toBeNull();
  });

  it('consumeStartupMessage reports unavailable storage', () => {
    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('x');
    });
    expect(freshStore().consumeStartupMessage()).toEqual({
      message: getUserMessage(ERROR_CODES.STORAGE_UNAVAILABLE),
      duration: 3500,
    });
    setItem.mockRestore();
  });

  it('toasts a storage error when saving fails', () => {
    const store = freshStore();
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('x');
    });
    store.toggleItem('0-0-0');
    expect(useToast().current.value).toBe(getUserMessage(ERROR_CODES.STORAGE_SAVE_FAILED));
  });
});
