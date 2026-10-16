import { createRouter, createWebHashHistory } from 'vue-router';

export const ROUTE_NAMES = { program: 'program' } as const;

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [],
});
