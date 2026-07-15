import { closestBySelector, escapeHtml, setBodyScrollLocked } from './dom.js';
import { ERROR_CODES } from './errors.js';
import * as storage from './storage.js';
import * as render from './render.js';

let entityFormMode = 'create';
let entityFormEditId = null;

function getOverlay(id) {
  return document.getElementById(id);
}

function openOverlay(overlayId) {
  const overlay = getOverlay(overlayId);
  if (!overlay) return;
  overlay.classList.add('show');
  setBodyScrollLocked(true);
}

function closeOverlay(overlayId) {
  const overlay = getOverlay(overlayId);
  if (!overlay) return;
  overlay.classList.remove('show');
  setBodyScrollLocked(false);
}

export function openSidebar() {
  openOverlay('sidebarOverlay');
}

export function closeSidebar() {
  closeOverlay('sidebarOverlay');
}

export function openInfo() {
  openOverlay('infoOverlay');
}

export function closeInfo() {
  closeOverlay('infoOverlay');
}

export function openEntitiesSheet() {
  renderEntitiesList();
  openOverlay('entitiesOverlay');
}

export function closeEntitiesSheet() {
  closeOverlay('entitiesOverlay');
}

export function renderEntitiesList() {
  const listEl = document.getElementById('entitiesList');
  if (!listEl) return;

  const entities = storage.getEntities();
  const allItemIds = render.getAllItemIds();
  const activeId = storage.getState()?.activeId ?? '';

  if (!entities.length) {
    listEl.innerHTML = '<div class="entities-empty">Пока никого нет.<br>Откройте меню <strong>☰</strong> и нажмите «Новый ученик / группа».</div>';
    return;
  }

  listEl.innerHTML = entities.map((entity) => {
    const isActive = entity.id === activeId;
    const pct = storage.getEntityProgressPct(entity.id, allItemIds);

    return `
      <div class="entities-item${isActive ? ' entities-item--active' : ''}" data-entity-id="${entity.id}">
        <button type="button" class="entities-item__main" data-action="switch-entity" data-entity-id="${entity.id}">
          <span class="entities-item__name">${escapeHtml(entity.name ?? storage.DEFAULT_ENTITY_NAME)}</span>
          <span class="entities-item__pct">${pct}%</span>
          ${isActive ? '<span class="entities-item__badge">активен</span>' : ''}
        </button>
        <div class="entities-item__actions">
          <button type="button" class="entities-item__btn" title="Редактировать" aria-label="Редактировать" data-action="edit-entity" data-entity-id="${entity.id}">✏</button>
          <button type="button" class="entities-item__btn entities-item__btn--danger" title="Удалить" aria-label="Удалить" data-action="delete-entity" data-entity-id="${entity.id}">🗑</button>
        </div>
      </div>`;
  }).join('');
}

export function openEntityForm(mode = 'create', entityId = null) {
  entityFormMode = mode;
  entityFormEditId = entityId;

  const titleEl = document.getElementById('entityFormTitle');
  const inputEl = document.getElementById('entityFormInput');
  const saveBtn = document.getElementById('entityFormSaveBtn');
  if (!inputEl) return;

  if (titleEl) {
    titleEl.textContent = mode === 'edit' ? 'Редактировать' : 'Новый ученик / группа';
  }
  if (saveBtn) {
    saveBtn.textContent = mode === 'edit' ? 'Сохранить' : 'Создать';
  }

  if (mode === 'edit' && entityId) {
    const entity = storage.getEntityById(entityId);
    inputEl.value = entity?.name ?? '';
  } else {
    inputEl.value = '';
  }

  closeEntitiesSheet();
  openOverlay('entityFormOverlay');
  setTimeout(() => {
    inputEl.focus();
    inputEl.select();
  }, 100);
}

export function closeEntityForm() {
  closeOverlay('entityFormOverlay');
  entityFormMode = 'create';
  entityFormEditId = null;
}

function showStorageErrorIfAny() {
  const code = storage.consumeStorageError();
  if (code) render.showError(code);
}

function validateEntityName(name) {
  const trimmed = name.trim();
  if (!trimmed) {
    render.showError(ERROR_CODES.ENTITY_NAME_REQUIRED);
    return null;
  }
  if (trimmed.length > storage.MAX_ENTITY_NAME_LEN) {
    render.showError(ERROR_CODES.ENTITY_NAME_TOO_LONG, {
      context: { maxLen: storage.MAX_ENTITY_NAME_LEN },
    });
    return null;
  }
  return trimmed;
}

export function saveEntityForm() {
  try {
    const inputEl = document.getElementById('entityFormInput');
    if (!inputEl) return;

    const name = validateEntityName(inputEl.value);
    if (!name) return;

    if (entityFormMode === 'edit' && entityFormEditId) {
      const entity = storage.updateEntity(entityFormEditId, name);
      if (!entity) {
        render.showError(ERROR_CODES.ENTITY_UPDATE_FAILED);
        return;
      }

      showStorageErrorIfAny();
      render.updateHeaderSubtitle();
      renderEntitiesList();
      render.showToast('Имя обновлено');
    } else {
      const entity = storage.createEntity(name);
      if (!entity) {
        render.showError(ERROR_CODES.ENTITY_CREATE_FAILED);
        return;
      }

      showStorageErrorIfAny();
      render.applyProgress();
      render.switchTab(0);
      render.updateHeaderSubtitle();
      render.showToast(`Создано: ${name}`);
    }

    closeEntityForm();
  } catch (error) {
    console.error('saveEntityForm failed', error);
    render.showError(error);
  }
}

export function switchEntity(id) {
  try {
    if (!id || id === storage.getState()?.activeId) {
      closeEntitiesSheet();
      return;
    }

    const entity = storage.switchEntity(id);
    if (!entity) {
      render.showError(ERROR_CODES.ENTITY_SWITCH_FAILED);
      return;
    }

    showStorageErrorIfAny();
    render.applyProgress();
    render.switchTab(storage.getSavedTabIndex() ?? 0);
    render.updateHeaderSubtitle();
    closeEntitiesSheet();
    render.showToast(`Выбрано: ${entity.name}`);
  } catch (error) {
    console.error('switchEntity failed', error);
    render.showError(error);
  }
}

export function deleteEntity(id) {
  try {
    if (storage.getEntities().length <= 1) {
      render.showError(ERROR_CODES.ENTITY_DELETE_LAST);
      return;
    }

    const entity = storage.getEntityById(id);
    if (!entity) {
      render.showError(ERROR_CODES.ENTITY_NOT_FOUND);
      return;
    }
    if (!confirm(`Удалить «${entity.name}»? Прогресс будет потерян.`)) return;

    const result = storage.deleteEntity(id);
    if (!result) {
      render.showError(ERROR_CODES.ENTITY_DELETE_FAILED);
      return;
    }

    showStorageErrorIfAny();

    if (result.wasActive) {
      render.applyProgress();
      render.switchTab(storage.getSavedTabIndex() ?? 0);
      render.updateHeaderSubtitle();
    }

    renderEntitiesList();
    render.showToast(`Удалено: ${result.entity?.name ?? 'запись'}`);
  } catch (error) {
    console.error('deleteEntity failed', error);
    render.showError(error);
  }
}

export function resetProgress() {
  try {
    const entity = storage.getActiveEntity();
    const name = entity?.name ?? storage.DEFAULT_ENTITY_NAME;

    if (confirm(`Сбросить прогресс для «${name}»?`)) {
      storage.clearActiveProgress();
      showStorageErrorIfAny();
      render.applyProgress();
      renderEntitiesList();
      render.showToast('Прогресс сброшен');
    }
  } catch (error) {
    console.error('resetProgress failed', error);
    render.showError(error);
  }
}

function bindEntityListDelegation() {
  const listEl = document.getElementById('entitiesList');
  if (!listEl) return;

  listEl.addEventListener('click', (event) => {
    const btn = closestBySelector(event.target, '[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const entityId = btn.getAttribute('data-entity-id');
    if (!entityId) return;

    const actions = {
      'switch-entity': () => switchEntity(entityId),
      'edit-entity': () => openEntityForm('edit', entityId),
      'delete-entity': () => deleteEntity(entityId),
    };

    actions[action]?.();
  });
}

function bindEntityForm() {
  document.getElementById('entityFormInput')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') saveEntityForm();
  });
}

export function initOverlays() {
  bindEntityListDelegation();
  bindEntityForm();
}
