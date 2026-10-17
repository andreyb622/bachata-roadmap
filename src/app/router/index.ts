import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useProfilesStore } from '@/modules/profiles';
import { ROUTE_NAMES, SEARCH_TAB, routeForTab } from '@/shared/config/route-names';

export { SEARCH_TAB, routeForTab };

declare module 'vue-router' {
  interface RouteMeta {
    hideTabs?: boolean;
    headerVariant?: 'main' | 'elements';
  }
}

export function tabFromRoute(route: {
  name?: unknown;
  params: Record<string, unknown>;
}): number | null {
  if (route.name === ROUTE_NAMES.program) return Number(route.params.period);
  if (route.name === ROUTE_NAMES.search) return SEARCH_TAB;
  return null;
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
