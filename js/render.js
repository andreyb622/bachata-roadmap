import { closestBySelector, escapeHtml } from './dom.js';
import { PROGRAM } from './program-data.js';
import * as storage from './storage.js';

/** @typedef {{ id: string, text: string, period: string, section: string, periodIdx: number }} SearchItem */

/** @type {SearchItem[]} */
let allItems = [];
let searchTimer = null;
let currentTabIndex = 0;

function buildItemIndex() {
  allItems = PROGRAM.flatMap((period) =>
    period.sections.flatMap((section, sectionIndex) =>
      section.items.map((text, itemIndex) => ({
        id: `${period.id}-${sectionIndex}-${itemIndex}`,
        text,
        period: period.name,
        section: section.title,
        periodIdx: period.id,
      })),
    ),
  );
  return allItems;
}

export function getAllItemIds() {
  return allItems.map((item) => item.id);
}

function renderSection(periodId, sectionIndex, section) {
  const sectionId = `${periodId}-${sectionIndex}`;
  const itemsHtml = section.items.map((text, itemIndex) => {
    const itemId = `${periodId}-${sectionIndex}-${itemIndex}`;
    return `
      <div class="item" data-id="${itemId}">
        <div class="item__check"></div>
        <div class="item__text">${escapeHtml(text)}</div>
      </div>`;
  }).join('');

  return `
    <div class="section${sectionIndex === 0 ? ' open' : ''}" data-section="${sectionId}">
      <div class="section__header">
        <span class="section__title">${escapeHtml(section.title)}</span>
        <span class="section__count">0/${section.items.length}</span>
        <span class="section__chevron">▼</span>
      </div>
      <div class="section__body">${itemsHtml}</div>
    </div>`;
}

function renderProgramPanels(container) {
  if (!container) return;

  container.innerHTML = PROGRAM.map((period, periodIndex) => {
    const sectionsHtml = period.sections
      .map((section, sectionIndex) => renderSection(period.id, sectionIndex, section))
      .join('');

    return `
      <div class="panel${periodIndex === 0 ? ' active' : ''}" id="panel-${period.id}" data-period="${period.id}">
        <div class="period-badge">${escapeHtml(period.badge)}</div>
        <div class="progress-wrap" data-progress="${period.id}">
          <div class="progress-wrap__label">
            <span>Прогресс</span>
            <span class="progress-pct">0%</span>
          </div>
          <div class="progress-bar"><div class="progress-bar__fill"></div></div>
        </div>
        ${sectionsHtml}
      </div>`;
  }).join('');
}

export function initRender(container) {
  buildItemIndex();
  renderProgramPanels(container);
}

export function applyProgress() {
  const progress = storage.getActiveProgress();

  for (const item of document.querySelectorAll('.item[data-id]')) {
    const id = item.getAttribute('data-id');
    item.classList.toggle('done', !!progress[id]);
  }

  updateCounts();
}

export function updateCounts() {
  const progress = storage.getActiveProgress();

  for (const section of document.querySelectorAll('.section')) {
    const secItems = section.querySelectorAll('.item[data-id]');
    if (!secItems.length) continue;

    const done = [...secItems].filter((item) => progress[item.getAttribute('data-id')]).length;
    const countEl = section.querySelector('.section__count');
    if (countEl) countEl.textContent = `${done}/${secItems.length}`;
  }

  for (const wrap of document.querySelectorAll('.progress-wrap[data-progress]')) {
    const period = wrap.getAttribute('data-progress');
    const panel = document.getElementById(`panel-${period}`);
    if (!panel) continue;

    const pItems = panel.querySelectorAll('.item[data-id]');
    const pDone = [...pItems].filter((item) => progress[item.getAttribute('data-id')]).length;
    const pct = pItems.length ? Math.round((pDone / pItems.length) * 100) : 0;

    const pctEl = wrap.querySelector('.progress-pct');
    if (pctEl) pctEl.textContent = `${pct}%`;
    const fillEl = wrap.querySelector('.progress-bar__fill');
    if (fillEl) fillEl.style.width = `${pct}%`;
  }
}

function toggleItem(item) {
  const id = item.getAttribute('data-id');
  if (!id) return;

  const isDone = storage.toggleProgressItem(id);
  item.classList.toggle('done', isDone);
  updateCounts();
}

function highlight(text, query) {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query);
  if (idx === -1) return escapeHtml(text);

  return `${escapeHtml(text.slice(0, idx))}<mark style="background:rgba(232,67,147,0.3);color:inherit;border-radius:2px">${escapeHtml(text.slice(idx, idx + query.length))}</mark>${escapeHtml(text.slice(idx + query.length))}`;
}

function renderSearchResults(query) {
  const searchResults = document.getElementById('searchResults');
  if (!searchResults) return;

  const q = query.trim().toLowerCase();
  if (!q) {
    searchResults.replaceChildren();
    return;
  }

  const matches = allItems.filter(
    (item) =>
      item.text.toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q),
  );

  if (!matches.length) {
    searchResults.innerHTML = '<div class="search-empty">Ничего не найдено</div>';
    return;
  }

  searchResults.innerHTML = matches.map((match) => `
    <div class="search-result-item" data-goto="${match.periodIdx}">
      <div class="search-result-item__period">${escapeHtml(match.period)} · ${escapeHtml(match.section)}</div>
      <div class="search-result-item__text">${highlight(match.text, q)}</div>
    </div>`).join('');
}

function onSearchInput() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  clearTimeout(searchTimer);
  const { value } = searchInput;
  searchTimer = setTimeout(() => renderSearchResults(value), 120);
}

export function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  if (searchInput) searchInput.value = '';
  searchResults?.replaceChildren();
}

export function switchTab(index) {
  currentTabIndex = index;

  document.querySelectorAll('.tab').forEach((tab, tabIndex) => {
    const isActive = tabIndex === index;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  document.querySelectorAll('.panel').forEach((panel, panelIndex) => {
    panel.classList.toggle('active', panelIndex === index);
  });

  storage.setSavedTabIndex(index);

  const main = document.querySelector('.main');
  if (main) main.scrollTop = 0;

  if (index === 3) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) setTimeout(() => searchInput.focus(), 100);
  }
}

export function getCurrentTabIndex() {
  return currentTabIndex;
}

export function updateHeaderSubtitle() {
  const title = document.getElementById('headerTitle');
  const subtitle = document.getElementById('headerSubtitle');
  const entity = storage.getActiveEntity();
  const entityName = entity?.name ?? storage.DEFAULT_ENTITY_NAME;
  const tabLabel = currentTabIndex < 3 ? PROGRAM[currentTabIndex].name : 'Поиск';

  if (title) title.textContent = `Бачата · ${entityName}`;
  if (subtitle) subtitle.textContent = tabLabel;
}

export function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

export function bindMainInteractions(onTabSwitch) {
  const main = document.querySelector('.main');
  if (main) {
    main.addEventListener('click', (event) => {
      const item = closestBySelector(event.target, '.item[data-id]');
      if (item) {
        toggleItem(item);
        return;
      }

      const result = closestBySelector(event.target, '.search-result-item');
      if (result) {
        const tabIdx = Number.parseInt(result.getAttribute('data-goto'), 10);
        onTabSwitch?.(tabIdx);
        clearSearch();
      }
    });
  }

  document.getElementById('searchInput')?.addEventListener('input', onSearchInput);
}
