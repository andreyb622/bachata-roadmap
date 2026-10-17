import type { RouteRecordRaw } from 'vue-router';
import { ROUTE_NAMES } from '@/shared/config/route-names';

export const elementsRoutes: RouteRecordRaw[] = [
  {
    path: '/elements',
    name: ROUTE_NAMES.elements,
    component: () => import('@/pages/ElementsPage/ElementsPage.vue'),
    meta: { hideTabs: true, headerVariant: 'elements' },
  },
];
