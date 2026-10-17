import type { RouteLocationRaw } from 'vue-router';

export const ROUTE_NAMES = {
  home: 'home',
  program: 'program',
  search: 'search',
  elements: 'elements',
} as const;

export const SEARCH_TAB = 3;

export function routeForTab(tab: number): RouteLocationRaw {
  if (tab === SEARCH_TAB) return { name: ROUTE_NAMES.search };
  if (Number.isInteger(tab) && tab >= 0 && tab <= 2) {
    return { name: ROUTE_NAMES.program, params: { period: String(tab) } };
  }
  return { name: ROUTE_NAMES.program, params: { period: '0' } };
}
