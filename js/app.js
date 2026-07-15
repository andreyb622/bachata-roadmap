import './sw-update.js';
import { initSectionToggles } from './sections.js';
import * as storage from './storage.js';
import * as render from './render.js';
import * as overlays from './overlays.js';

const INSTALL_HINT_KEY = 'bachata-install-hint-dismissed';

function dismissInstallHint() {
  try {
    sessionStorage.setItem(INSTALL_HINT_KEY, '1');
  } catch {
    // ignore private mode
  }

  document.getElementById('installHint')?.classList.remove('show');
  document.documentElement.classList.remove('install-hint-visible');
  document.documentElement.style.removeProperty('--install-hint-h');
}

function isFirstPageLoad() {
  try {
    const [nav] = performance.getEntriesByType('navigation');
    if (nav) return nav.type === 'navigate';
  } catch {
    // ignore
  }

  try {
    return !sessionStorage.getItem(INSTALL_HINT_KEY);
  } catch {
    return false;
  }
}

function maybeShowInstallHint() {
  if (document.documentElement.classList.contains('standalone')) return;

  try {
    if (sessionStorage.getItem(INSTALL_HINT_KEY)) return;
  } catch {
    return;
  }

  if (!isFirstPageLoad()) return;

  const el = document.getElementById('installHint');
  if (!el) return;

  setTimeout(() => {
    try {
      if (sessionStorage.getItem(INSTALL_HINT_KEY)) return;
    } catch {
      return;
    }

    el.classList.add('show');
    document.documentElement.classList.add('install-hint-visible');
    document.documentElement.style.setProperty('--install-hint-h', `${el.offsetHeight}px`);
  }, 500);
}

function markStandalone() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    document.documentElement.classList.add('standalone');
  }
}

function handleTabSwitch(index) {
  if (render.getCurrentTabIndex() !== index) {
    dismissInstallHint();
  }
  render.switchTab(index);
  render.updateHeaderSubtitle();
}

function exposeGlobals() {
  Object.assign(window, {
    __bCloseInstallHint: dismissInstallHint,
    __bOpenSidebar: overlays.openSidebar,
    __bCloseSidebar: overlays.closeSidebar,
    __bMenuEntities: () => {
      overlays.closeSidebar();
      overlays.openEntitiesSheet();
    },
    __bMenuCreateEntity: () => {
      overlays.closeSidebar();
      overlays.openEntityForm('create');
    },
    __bMenuInfo: () => {
      overlays.closeSidebar();
      overlays.openInfo();
    },
    __bMenuReset: () => {
      overlays.closeSidebar();
      overlays.resetProgress();
    },
    __bSwitchTab: handleTabSwitch,
    __bReset: overlays.resetProgress,
    __bInfo: overlays.openInfo,
    __bCloseInfo: overlays.closeInfo,
    __bOpenEntities: overlays.openEntitiesSheet,
    __bCloseEntities: overlays.closeEntitiesSheet,
    __bOpenCreateEntity: () => overlays.openEntityForm('create'),
    __bCloseEntityForm: overlays.closeEntityForm,
    __bSaveEntityForm: overlays.saveEntityForm,
    __bSwitchEntity: overlays.switchEntity,
    __bEditEntity: (id) => overlays.openEntityForm('edit', id),
    __bDeleteEntity: overlays.deleteEntity,
  });
}

function init() {
  try {
    document.documentElement.classList.add('js-ready');
    markStandalone();
    exposeGlobals();

    storage.initStorage();
    initSectionToggles();

    render.initRender(document.getElementById('programPanels'));
    overlays.initOverlays();

    render.bindMainInteractions(handleTabSwitch);
    render.applyProgress();

    const savedTab = storage.getSavedTabIndex();
    if (savedTab !== null) {
      handleTabSwitch(savedTab);
    } else {
      render.updateHeaderSubtitle();
    }

    maybeShowInstallHint();

    if (!storage.isStorageOk()) {
      render.showToast('Хранилище недоступно — прогресс не сохранится');
    }
  } catch {
    const subtitle = document.getElementById('headerSubtitle');
    if (subtitle) subtitle.textContent = 'Ошибка загрузки скрипта';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
