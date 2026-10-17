import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteLocationRaw, RouteRecordRaw } from 'vue-router';
import { useProfilesStore } from '@/stores/useProfilesStore';
import { ROUTE_NAMES } from '@/shared/config/route-names';

declare module 'vue-router' {
  interface RouteMeta {
    hideTabs?: boolean;
    headerVariant?: 'main' | 'elements';
  }
}

const SEARCH_TAB = 3;

export function tabFromRoute(route: {
  name?: unknown;
  params: Record<string, unknown>;
}): number | null {
  if (route.name === ROUTE_NAMES.program) return Number(route.params.period);
  if (route.name === ROUTE_NAMES.search) return SEARCH_TAB;
  return null;
}

export function routeForTab(tab: number): RouteLocationRaw {
  if (tab === SEARCH_TAB) return { name: ROUTE_NAMES.search };
  if (Number.isInteger(tab) && tab >= 0 && tab <= 2) {
    return { name: ROUTE_NAMES.program, params: { period: String(tab) } };
  }
  return { name: ROUTE_NAMES.program, params: { period: '0' } };
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_NAMES.home,
    redirect: () => {
      try {
        return routeForTab(useProfilesStore().savedTab);
      } catch {
        return routeForTab(0);
      }
    },
  },
  {
    path: '/program/:period(0|1|2)',
    name: ROUTE_NAMES.program,
    component: () => import('@/pages/ProgramPage/ProgramPage.vue'),
  },
  {
    path: '/search',
    name: ROUTE_NAMES.search,
    component: () => import('@/pages/SearchPage/SearchPage.vue'),
  },
  {
    path: '/elements',
    name: ROUTE_NAMES.elements,
    component: () => import('@/pages/ElementsPage/ElementsPage.vue'),
    meta: { hideTabs: true, headerVariant: 'elements' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});
