import type { RouteRecordRaw } from 'vue-router';
import { ROUTE_NAMES } from '@/shared/config/route-names';

export const searchRoutes: RouteRecordRaw[] = [
  {
    path: '/search',
    name: ROUTE_NAMES.search,
    component: () => import('@/pages/SearchPage/SearchPage.vue'),
  },
];
