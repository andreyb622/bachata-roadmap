import type { RouteRecordRaw } from 'vue-router';
import { ROUTE_NAMES } from '@/shared/config/route-names';

export const programRoutes: RouteRecordRaw[] = [
  {
    path: '/program/:period(0|1|2)',
    name: ROUTE_NAMES.program,
    component: () => import('@/pages/ProgramPage/ProgramPage.vue'),
  },
];
