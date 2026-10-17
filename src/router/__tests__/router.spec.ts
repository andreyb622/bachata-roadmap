import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { initStorage, setSavedTabIndex } from '@/modules/profiles';
import { ROUTE_NAMES } from '@/shared/config/route-names';
import { routeForTab, routes, tabFromRoute } from '@/router';

function makeRouter() {
  return createRouter({ history: createMemoryHistory(), routes });
}

describe('router', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('redirects / to /program/0 by default', async () => {
    const router = makeRouter();
    await router.push('/');
    expect(router.currentRoute.value.fullPath).toBe('/program/0');
  });

  it('redirects / to the saved tab', async () => {
    initStorage();
    setSavedTabIndex(3);
    const router = makeRouter();
    await router.push('/');
    expect(router.currentRoute.value.fullPath).toBe('/search');
  });

  it('round-trips tabs through routeForTab and tabFromRoute', async () => {
    const router = makeRouter();
    for (const tab of [0, 1, 2, 3]) {
      await router.push(routeForTab(tab));
      expect(tabFromRoute(router.currentRoute.value)).toBe(tab);
    }
    expect(tabFromRoute({ name: ROUTE_NAMES.elements, params: {} })).toBeNull();
  });

  it('redirects unknown paths to /program/0', async () => {
    const router = makeRouter();
    await router.push('/nope/nothing');
    expect(router.currentRoute.value.fullPath).toBe('/program/0');
  });
});
