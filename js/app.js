      'use strict';

      var STATE_KEY = 'bachata-state-v2';
      var OLD_PROGRESS_KEY = 'bachata-progress-v1';
      var OLD_TAB_KEY = 'bachata-tab-v1';
      var INSTALL_HINT_KEY = 'bachata-install-hint-dismissed';
      var PERIOD_NAMES = ['3 месяца', '3–5 месяцев', '6+ месяцев'];
      var DEFAULT_ENTITY_NAME = 'Мой прогресс';
      var MAX_ENTITY_NAME_LEN = 50;

      var state = {
        version: 2,
        entities: [],
        activeId: '',
        progress: {},
        tabs: {}
      };
      var progress = {};
      var allItems = [];
      var storageOk = false;
      var currentTabIndex = 0;
      var entityFormMode = 'create';
      var entityFormEditId = null;

      /* Совместимость с iPhone/Safari: не полагаемся на Element.closest(). */
      function matchesSelector(el, selector) {
        if (!el || el.nodeType !== 1) return false;
        var fn = el.matches ||
          el.webkitMatchesSelector ||
          el.msMatchesSelector ||
          el.mozMatchesSelector;
        return fn ? fn.call(el, selector) : false;
      }

      function closestBySelector(el, selector) {
        while (el && el !== document) {
          if (matchesSelector(el, selector)) return el;
          el = el.parentNode;
        }
        return null;
      }

      /* ── Безопасное хранилище (localStorage + fallback) ── */
      var memStore = {};

      function testStorage() {
        try {
          var k = '__bachata_test__';
          localStorage.setItem(k, '1');
          localStorage.removeItem(k);
          return true;
        } catch (e) {
          return false;
        }
      }

      function storageGet(key) {
        if (storageOk) {
          try { return localStorage.getItem(key); } catch (e) { /* fallthrough */ }
        }
        return memStore[key] != null ? memStore[key] : null;
      }

      function storageSet(key, val) {
        if (storageOk) {
          try { localStorage.setItem(key, val); return; } catch (e) { /* fallthrough */ }
        }
        memStore[key] = val;
      }

      function storageRemove(key) {
        if (storageOk) {
          try { localStorage.removeItem(key); } catch (e) { /* fallthrough */ }
        }
        delete memStore[key];
      }

      function generateId() {
        return 'e_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
      }

      function createDefaultState() {
        var id = generateId();
        return {
          version: 2,
          entities: [{ id: id, name: DEFAULT_ENTITY_NAME, createdAt: new Date().toISOString() }],
          activeId: id,
          progress: {},
          tabs: {}
        };
      }

      function migrateFromV1() {
        var oldProgress = {};
        var oldTab = '0';
        try {
          var raw = storageGet(OLD_PROGRESS_KEY);
          if (raw) oldProgress = JSON.parse(raw);
        } catch (e) { /* ignore */ }
        var savedTab = storageGet(OLD_TAB_KEY);
        if (savedTab !== null && savedTab !== '') oldTab = savedTab;

        var id = generateId();
        state = {
          version: 2,
          entities: [{ id: id, name: DEFAULT_ENTITY_NAME, createdAt: new Date().toISOString() }],
          activeId: id,
          progress: {},
          tabs: {}
        };
        state.progress[id] = oldProgress;
        state.tabs[id] = oldTab;
        cleanupOrphanProgressForEntity(id);
        saveState();
        storageRemove(OLD_PROGRESS_KEY);
        storageRemove(OLD_TAB_KEY);
      }

      function loadState() {
        try {
          var raw = storageGet(STATE_KEY);
          if (raw) {
            state = JSON.parse(raw);
            if (!state.entities || !state.entities.length) {
              state = createDefaultState();
              saveState();
            }
            if (!state.progress) state.progress = {};
            if (!state.tabs) state.tabs = {};
            if (!state.activeId || !getEntityById(state.activeId)) {
              state.activeId = state.entities[0].id;
              saveState();
            }
          } else if (storageGet(OLD_PROGRESS_KEY)) {
            migrateFromV1();
          } else {
            state = createDefaultState();
            saveState();
          }
        } catch (e) {
          state = createDefaultState();
        }
        syncProgressFromState();
      }

      function saveState() {
        try {
          storageSet(STATE_KEY, JSON.stringify(state));
        } catch (e) { /* ignore */ }
      }

      function syncProgressFromState() {
        var activeProgress = state.progress[state.activeId];
        progress = activeProgress ? Object.assign({}, activeProgress) : {};
        cleanupOrphanProgress();
      }

      function syncProgressToState() {
        state.progress[state.activeId] = Object.assign({}, progress);
        saveState();
      }

      function getEntityById(id) {
        for (var i = 0; i < state.entities.length; i++) {
          if (state.entities[i].id === id) return state.entities[i];
        }
        return null;
      }

      function getActiveEntity() {
        return getEntityById(state.activeId);
      }

      function cleanupOrphanProgressForEntity(entityId) {
        var entityProgress = state.progress[entityId];
        if (!entityProgress) return;
        var keys = Object.keys(entityProgress);
        var changed = false;
        for (var i = 0; i < keys.length; i++) {
          if (keys[i].charAt(0) === '3' && keys[i].indexOf('-') !== -1) {
            delete entityProgress[keys[i]];
            changed = true;
          }
        }
        if (changed) saveState();
      }

      function cleanupOrphanProgress() {
        var keys = Object.keys(progress);
        var changed = false;
        for (var i = 0; i < keys.length; i++) {
          if (keys[i].charAt(0) === '3' && keys[i].indexOf('-') !== -1) {
            delete progress[keys[i]];
            changed = true;
          }
        }
        if (changed) syncProgressToState();
      }

      function saveProgress() {
        syncProgressToState();
      }

      function applyProgress() {
        var items = document.querySelectorAll('.item[data-id]');
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var id = item.getAttribute('data-id');
          if (progress[id]) {
            item.classList.add('done');
          } else {
            item.classList.remove('done');
          }
        }
        updateCounts();
      }

      function getEntityProgressPct(entityId) {
        var entityProgress = state.progress[entityId] || {};
        var total = allItems.length;
        if (!total) return 0;
        var done = 0;
        for (var i = 0; i < allItems.length; i++) {
          if (entityProgress[allItems[i].id]) done++;
        }
        return Math.round((done / total) * 100);
      }

      function updateHeaderSubtitle() {
        var title = document.getElementById('headerTitle');
        var subtitle = document.getElementById('headerSubtitle');
        var entity = getActiveEntity();
        var entityName = entity ? entity.name : DEFAULT_ENTITY_NAME;
        var tabLabel = currentTabIndex < 3 ? PERIOD_NAMES[currentTabIndex] : 'Поиск';
        if (title) title.textContent = 'Бачата · ' + entityName;
        if (subtitle) subtitle.textContent = tabLabel;
      }

      function updateCounts() {
        var sections = document.querySelectorAll('.section');
        for (var s = 0; s < sections.length; s++) {
          var section = sections[s];
          var secItems = section.querySelectorAll('.item[data-id]');
          if (!secItems.length) continue;
          var done = 0;
          for (var j = 0; j < secItems.length; j++) {
            if (secItems[j].classList.contains('done')) done++;
          }
          var countEl = section.querySelector('.section__count');
          if (countEl) countEl.textContent = done + '/' + secItems.length;
        }

        var wraps = document.querySelectorAll('.progress-wrap[data-progress]');
        for (var w = 0; w < wraps.length; w++) {
          var wrap = wraps[w];
          var period = wrap.getAttribute('data-progress');
          var panel = document.getElementById('panel-' + period);
          if (!panel) continue;
          var pItems = panel.querySelectorAll('.item[data-id]');
          var pDone = 0;
          for (var k = 0; k < pItems.length; k++) {
            if (progress[pItems[k].getAttribute('data-id')]) pDone++;
          }
          var pct = pItems.length ? Math.round((pDone / pItems.length) * 100) : 0;
          var pctEl = wrap.querySelector('.progress-pct');
          var fillEl = wrap.querySelector('.progress-bar__fill');
          if (pctEl) pctEl.textContent = pct + '%';
          if (fillEl) fillEl.style.width = pct + '%';
        }
      }

      function showToast(msg) {
        var toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(function () { toast.classList.remove('show'); }, 2000);
      }

      function switchTab(index) {
        var prevTab = currentTabIndex;
        currentTabIndex = index;
        if (prevTab !== index) {
          dismissInstallHint();
        }
        var tabs = document.querySelectorAll('.tab');
        var panels = document.querySelectorAll('.panel');
        for (var i = 0; i < tabs.length; i++) {
          if (i === index) {
            tabs[i].classList.add('active');
            tabs[i].setAttribute('aria-selected', 'true');
          } else {
            tabs[i].classList.remove('active');
            tabs[i].setAttribute('aria-selected', 'false');
          }
        }
        for (var p = 0; p < panels.length; p++) {
          if (p === index) {
            panels[p].classList.add('active');
          } else {
            panels[p].classList.remove('active');
          }
        }
        state.tabs[state.activeId] = String(index);
        saveState();
        updateHeaderSubtitle();

        var main = document.querySelector('.main');
        if (main) main.scrollTop = 0;

        if (index === 3) {
          var searchInput = document.getElementById('searchInput');
          if (searchInput) {
            setTimeout(function () { searchInput.focus(); }, 100);
          }
        }
      }

      function toggleItem(item) {
        var id = item.getAttribute('data-id');
        if (!id) return;
        if (progress[id]) {
          delete progress[id];
          item.classList.remove('done');
        } else {
          progress[id] = true;
          item.classList.add('done');
        }
        saveProgress();
        updateCounts();
      }

      function buildSearchIndex() {
        allItems = [];
        var items = document.querySelectorAll('.panel .item[data-id]');
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var panel = closestBySelector(item, '.panel');
          if (!panel || panel.id === 'panel-search') continue;
          var periodIdx = parseInt(panel.getAttribute('data-period'), 10);
          if (isNaN(periodIdx)) continue;
          var section = closestBySelector(item, '.section');
          var titleEl = section ? section.querySelector('.section__title') : null;
          var sectionTitle = titleEl ? titleEl.textContent.replace(/extra/gi, '').trim() : '';
          var textEl = item.querySelector('.item__text');
          allItems.push({
            id: item.getAttribute('data-id'),
            text: textEl ? textEl.textContent : '',
            period: PERIOD_NAMES[periodIdx] || '',
            section: sectionTitle,
            periodIdx: periodIdx
          });
        }
      }

      function highlight(text, q) {
        var lower = text.toLowerCase();
        var idx = lower.indexOf(q);
        if (idx === -1) return text;
        return text.slice(0, idx) +
          '<mark style="background:rgba(232,67,147,0.3);color:inherit;border-radius:2px">' +
          text.slice(idx, idx + q.length) + '</mark>' +
          text.slice(idx + q.length);
      }

      function onSearchInput() {
        var searchInput = document.getElementById('searchInput');
        var searchResults = document.getElementById('searchResults');
        if (!searchInput || !searchResults) return;

        var q = searchInput.value.trim().toLowerCase();
        if (!q) {
          searchResults.innerHTML = '';
          return;
        }

        var matches = [];
        for (var i = 0; i < allItems.length; i++) {
          var it = allItems[i];
          if (it.text.toLowerCase().indexOf(q) !== -1 ||
              it.section.toLowerCase().indexOf(q) !== -1) {
            matches.push(it);
          }
        }

        if (!matches.length) {
          searchResults.innerHTML = '<div class="search-empty">Ничего не найдено</div>';
          return;
        }

        var html = '';
        for (var m = 0; m < matches.length; m++) {
          var match = matches[m];
          html += '<div class="search-result-item" data-goto="' + match.periodIdx + '">' +
            '<div class="search-result-item__period">' + match.period + ' · ' + match.section + '</div>' +
            '<div class="search-result-item__text">' + highlight(match.text, q) + '</div>' +
            '</div>';
        }
        searchResults.innerHTML = html;
      }

      /* ── Управление учениками / группами ── */

      function renderEntitiesList() {
        var listEl = document.getElementById('entitiesList');
        if (!listEl) return;

        if (!state.entities.length) {
          listEl.innerHTML = '<div class="entities-empty">Пока никого нет.<br>Откройте меню <strong>☰</strong> и нажмите «Новый ученик / группа».</div>';
          return;
        }

        var html = '';
        for (var i = 0; i < state.entities.length; i++) {
          var entity = state.entities[i];
          var isActive = entity.id === state.activeId;
          var pct = getEntityProgressPct(entity.id);
          html += '<div class="entities-item' + (isActive ? ' entities-item--active' : '') + '" data-entity-id="' + entity.id + '">' +
            '<button type="button" class="entities-item__main" onclick="window.__bSwitchEntity && window.__bSwitchEntity(\'' + entity.id + '\')">' +
              '<span class="entities-item__name">' + escapeHtml(entity.name) + '</span>' +
              '<span class="entities-item__pct">' + pct + '%</span>' +
              (isActive ? '<span class="entities-item__badge">активен</span>' : '') +
            '</button>' +
            '<div class="entities-item__actions">' +
              '<button type="button" class="entities-item__btn" title="Редактировать" aria-label="Редактировать" onclick="event.stopPropagation(); window.__bEditEntity && window.__bEditEntity(\'' + entity.id + '\')">✏</button>' +
              '<button type="button" class="entities-item__btn entities-item__btn--danger" title="Удалить" aria-label="Удалить" onclick="event.stopPropagation(); window.__bDeleteEntity && window.__bDeleteEntity(\'' + entity.id + '\')">🗑</button>' +
            '</div>' +
          '</div>';
        }
        listEl.innerHTML = html;
      }

      function escapeHtml(str) {
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }

      function openEntitiesSheet() {
        renderEntitiesList();
        var overlay = document.getElementById('entitiesOverlay');
        if (!overlay) return;
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
      }

      function closeEntitiesSheet() {
        var overlay = document.getElementById('entitiesOverlay');
        if (!overlay) return;
        overlay.classList.remove('show');
        document.body.style.overflow = 'hidden';
      }

      function openEntityForm(mode, entityId) {
        entityFormMode = mode || 'create';
        entityFormEditId = entityId || null;

        var overlay = document.getElementById('entityFormOverlay');
        var titleEl = document.getElementById('entityFormTitle');
        var inputEl = document.getElementById('entityFormInput');
        var saveBtn = document.getElementById('entityFormSaveBtn');
        if (!overlay || !inputEl) return;

        if (titleEl) {
          titleEl.textContent = mode === 'edit' ? 'Редактировать' : 'Новый ученик / группа';
        }
        if (saveBtn) {
          saveBtn.textContent = mode === 'edit' ? 'Сохранить' : 'Создать';
        }

        if (mode === 'edit' && entityId) {
          var entity = getEntityById(entityId);
          inputEl.value = entity ? entity.name : '';
        } else {
          inputEl.value = '';
        }

        closeEntitiesSheet();
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        setTimeout(function () {
          inputEl.focus();
          inputEl.select();
        }, 100);
      }

      function closeEntityForm() {
        var overlay = document.getElementById('entityFormOverlay');
        if (!overlay) return;
        overlay.classList.remove('show');
        document.body.style.overflow = 'hidden';
        entityFormMode = 'create';
        entityFormEditId = null;
      }

      function validateEntityName(name) {
        var trimmed = name.trim();
        if (!trimmed) {
          showToast('Введите имя или название');
          return null;
        }
        if (trimmed.length > MAX_ENTITY_NAME_LEN) {
          showToast('Не более ' + MAX_ENTITY_NAME_LEN + ' символов');
          return null;
        }
        return trimmed;
      }

      function saveEntityForm() {
        var inputEl = document.getElementById('entityFormInput');
        if (!inputEl) return;
        var name = validateEntityName(inputEl.value);
        if (!name) return;

        if (entityFormMode === 'edit' && entityFormEditId) {
          updateEntity(entityFormEditId, name);
        } else {
          createEntity(name);
        }
        closeEntityForm();
      }

      function createEntity(name) {
        var id = generateId();
        state.entities.push({
          id: id,
          name: name,
          createdAt: new Date().toISOString()
        });
        state.progress[id] = {};
        state.tabs[id] = '0';
        state.activeId = id;
        saveState();
        syncProgressFromState();
        applyProgress();
        switchTab(0);
        showToast('Создано: ' + name);
      }

      function updateEntity(id, name) {
        var entity = getEntityById(id);
        if (!entity) return;
        entity.name = name;
        saveState();
        updateHeaderSubtitle();
        renderEntitiesList();
        showToast('Имя обновлено');
      }

      function deleteEntity(id) {
        if (state.entities.length <= 1) {
          showToast('Нельзя удалить последнего');
          return;
        }
        var entity = getEntityById(id);
        if (!entity) return;
        if (!confirm('Удалить «' + entity.name + '»? Прогресс будет потерян.')) return;

        var wasActive = state.activeId === id;
        state.entities = state.entities.filter(function (e) { return e.id !== id; });
        delete state.progress[id];
        delete state.tabs[id];

        if (wasActive) {
          state.activeId = state.entities[0].id;
          syncProgressFromState();
          applyProgress();
          var savedTab = state.tabs[state.activeId];
          var tabIdx = savedTab !== undefined ? parseInt(savedTab, 10) : 0;
          if (isNaN(tabIdx) || tabIdx < 0 || tabIdx > 3) tabIdx = 0;
          switchTab(tabIdx);
        }

        saveState();
        renderEntitiesList();
        showToast('Удалено: ' + entity.name);
      }

      function switchEntity(id) {
        if (id === state.activeId) {
          closeEntitiesSheet();
          return;
        }
        var entity = getEntityById(id);
        if (!entity) return;

        syncProgressToState();
        state.activeId = id;
        saveState();
        syncProgressFromState();
        applyProgress();

        var savedTab = state.tabs[id];
        var tabIdx = savedTab !== undefined ? parseInt(savedTab, 10) : 0;
        if (tabIdx === 4) tabIdx = 3;
        if (isNaN(tabIdx) || tabIdx < 0 || tabIdx > 3) tabIdx = 0;
        switchTab(tabIdx);
        closeEntitiesSheet();
        showToast('Выбрано: ' + entity.name);
      }

      function editEntity(id) {
        openEntityForm('edit', id);
      }

      function bindInteractions() {
        var headers = document.querySelectorAll('.section__header');
        for (var h = 0; h < headers.length; h++) {
          (function (header) {
            header.addEventListener('click', function () {
              var section = closestBySelector(header, '.section');
              if (section) section.classList.toggle('open');
            });
          })(headers[h]);
        }

        var items = document.querySelectorAll('.item[data-id]');
        for (var i = 0; i < items.length; i++) {
          (function (item) {
            item.addEventListener('click', function () {
              toggleItem(item);
            });
          })(items[i]);
        }

        var searchResults = document.getElementById('searchResults');
        if (searchResults) {
          searchResults.addEventListener('click', function (e) {
            var result = closestBySelector(e.target, '.search-result-item');
            if (!result) return;
            switchTab(parseInt(result.getAttribute('data-goto'), 10));
            var si = document.getElementById('searchInput');
            if (si) si.value = '';
            searchResults.innerHTML = '';
          });
        }

        var entityFormInput = document.getElementById('entityFormInput');
        if (entityFormInput) {
          entityFormInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') saveEntityForm();
          });
        }
      }

      function openSidebar() {
        var overlay = document.getElementById('sidebarOverlay');
        if (!overlay) return;
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
      }

      function closeSidebar() {
        var overlay = document.getElementById('sidebarOverlay');
        if (!overlay) return;
        overlay.classList.remove('show');
        document.body.style.overflow = 'hidden';
      }

      function resetProgress() {
        var entity = getActiveEntity();
        var name = entity ? entity.name : DEFAULT_ENTITY_NAME;
        if (confirm('Сбросить прогресс для «' + name + '»?')) {
          progress = {};
          state.progress[state.activeId] = {};
          saveState();
          applyProgress();
          renderEntitiesList();
          showToast('Прогресс сброшен');
        }
      }

      function openInfo() {
        var overlay = document.getElementById('infoOverlay');
        if (!overlay) return;
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
      }

      function closeInfo() {
        var overlay = document.getElementById('infoOverlay');
        if (!overlay) return;
        overlay.classList.remove('show');
        document.body.style.overflow = 'hidden';
      }

      /* Глобальные функции для inline onclick — самый надёжный способ на iOS */
      window.__bCloseInstallHint = closeInstallHint;
      window.__bOpenSidebar = openSidebar;
      window.__bCloseSidebar = closeSidebar;
      window.__bMenuEntities = function () { closeSidebar(); openEntitiesSheet(); };
      window.__bMenuCreateEntity = function () { closeSidebar(); openEntityForm('create'); };
      window.__bMenuInfo = function () { closeSidebar(); openInfo(); };
      window.__bMenuReset = function () { closeSidebar(); resetProgress(); };
      window.__bSwitchTab = switchTab;
      window.__bReset = resetProgress;
      window.__bInfo = openInfo;
      window.__bCloseInfo = closeInfo;
      window.__bOpenEntities = openEntitiesSheet;
      window.__bCloseEntities = closeEntitiesSheet;
      window.__bOpenCreateEntity = function () { openEntityForm('create'); };
      window.__bCloseEntityForm = closeEntityForm;
      window.__bSaveEntityForm = saveEntityForm;
      window.__bSwitchEntity = switchEntity;
      window.__bEditEntity = editEntity;
      window.__bDeleteEntity = deleteEntity;

      function dismissInstallHint() {
        try { sessionStorage.setItem(INSTALL_HINT_KEY, '1'); } catch (e) { /* ignore */ }
        var el = document.getElementById('installHint');
        if (el) el.classList.remove('show');
        document.documentElement.classList.remove('install-hint-visible');
        document.documentElement.style.removeProperty('--install-hint-h');
      }

      function isFirstPageLoad() {
        try {
          var nav = performance.getEntriesByType('navigation')[0];
          if (nav) return nav.type === 'navigate';
        } catch (e) { /* ignore */ }
        try {
          return !sessionStorage.getItem(INSTALL_HINT_KEY);
        } catch (e) {
          return false;
        }
      }

      function maybeShowInstallHint() {
        if (document.documentElement.className.indexOf('standalone') !== -1) return;
        try {
          if (sessionStorage.getItem(INSTALL_HINT_KEY)) return;
        } catch (e) { return; }
        if (!isFirstPageLoad()) return;

        var el = document.getElementById('installHint');
        if (!el) return;

        setTimeout(function () {
          try {
            if (sessionStorage.getItem(INSTALL_HINT_KEY)) return;
          } catch (e) { return; }
          el.classList.add('show');
          document.documentElement.classList.add('install-hint-visible');
          document.documentElement.style.setProperty('--install-hint-h', el.offsetHeight + 'px');
        }, 500);
      }

      function closeInstallHint() {
        dismissInstallHint();
      }

      function markStandalone() {
        var isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
          window.navigator.standalone === true;
        if (isStandalone) {
          document.documentElement.className += ' standalone';
        }
      }

      function init() {
        try {
          document.documentElement.className += ' js-ready';
          markStandalone();
          storageOk = testStorage();
          bindInteractions();

          var searchInput = document.getElementById('searchInput');
          if (searchInput) {
            searchInput.addEventListener('input', onSearchInput);
          }

          buildSearchIndex();
          loadState();
          applyProgress();

          var savedTab = state.tabs[state.activeId];
          if (savedTab !== undefined && savedTab !== null && savedTab !== '') {
            var tabIdx = parseInt(savedTab, 10);
            if (tabIdx === 4) tabIdx = 3;
            if (!isNaN(tabIdx) && tabIdx >= 0 && tabIdx <= 3) {
              switchTab(tabIdx);
            } else {
              updateHeaderSubtitle();
            }
          } else {
            updateHeaderSubtitle();
          }

          maybeShowInstallHint();

          if (!storageOk) {
            showToast('Хранилище недоступно — прогресс не сохранится');
          }
        } catch (err) {
          var sub = document.getElementById('headerSubtitle');
          if (sub) sub.textContent = 'Ошибка загрузки скрипта';
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
