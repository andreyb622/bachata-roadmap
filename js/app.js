      'use strict';

      var STORAGE_KEY = 'bachata-progress-v1';
      var TAB_KEY = 'bachata-tab-v1';
      var PERIOD_NAMES = ['3 месяца', '3–5 месяцев', '6+ месяцев'];

      var progress = {};
      var allItems = [];
      var storageOk = false;

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

      function loadProgress() {
        try {
          var raw = storageGet(STORAGE_KEY);
          progress = raw ? JSON.parse(raw) : {};
        } catch (e) {
          progress = {};
        }
        cleanupOrphanProgress();
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
        if (changed) saveProgress();
      }

      function saveProgress() {
        try {
          storageSet(STORAGE_KEY, JSON.stringify(progress));
        } catch (e) { /* ignore */ }
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
        var subtitle = document.getElementById('headerSubtitle');
        if (subtitle) {
          subtitle.textContent = index < 3 ? PERIOD_NAMES[index] : 'Поиск по элементам';
        }
        storageSet(TAB_KEY, String(index));

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
      }

      function resetProgress() {
        if (confirm('Сбросить весь прогресс?')) {
          progress = {};
          storageRemove(STORAGE_KEY);
          applyProgress();
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
      window.__bSwitchTab = switchTab;
      window.__bReset = resetProgress;
      window.__bInfo = openInfo;
      window.__bCloseInfo = closeInfo;

      function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('./sw.js').catch(function () { /* ignore */ });
        });
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
          registerServiceWorker();
          storageOk = testStorage();
          bindInteractions();

          var searchInput = document.getElementById('searchInput');
          if (searchInput) {
            searchInput.addEventListener('input', onSearchInput);
          }

          buildSearchIndex();
          loadProgress();
          applyProgress();

          var savedTab = storageGet(TAB_KEY);
          if (savedTab !== null && savedTab !== '') {
            var tabIdx = parseInt(savedTab, 10);
            if (tabIdx === 4) tabIdx = 3;
            if (!isNaN(tabIdx) && tabIdx >= 0 && tabIdx <= 3) {
              switchTab(tabIdx);
            }
          }

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
