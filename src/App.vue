<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from '@/components/AppHeader/AppHeader.vue';
import AppToast from '@/components/AppToast/AppToast.vue';
import BottomTabs from '@/components/BottomTabs/BottomTabs.vue';
import InstallHint from '@/components/InstallHint/InstallHint.vue';
import { useInstallHint } from '@/composables/useInstallHint';
import { useStandalone } from '@/composables/useStandalone';
import { useToast } from '@/composables/useToast';
import { APP_NAME } from '@/data/app-meta';
import { PROGRAM } from '@/data/program';
import { ERROR_CODES } from '@/lib/errors';
import { DEFAULT_ENTITY_NAME } from '@/lib/storage';
import { routeForTab, tabFromRoute } from '@/router';
import { useProfilesStore } from '@/stores/useProfilesStore';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const initFailed = ref(false);
let store: ReturnType<typeof useProfilesStore> | null = null;

try {
  store = useProfilesStore();
  const startup = store.consumeStartupMessage();
  if (startup) toast.show(startup.message, startup.duration);
} catch (err) {
  console.error(err);
  initFailed.value = true;
  toast.showError(ERROR_CODES.APP_INIT_FAILED);
}

const { isVisible, dismiss } = useInstallHint();
const standalone = useStandalone();

watchEffect(() => {
  document.documentElement.classList.toggle('standalone', standalone.value);
});

const mainRef = useTemplateRef<HTMLElement>('main');

const tab = computed(() => tabFromRoute(route));
const variant = computed(() => route.meta.headerVariant ?? 'main');

const title = computed(() =>
  variant.value === 'elements'
    ? 'Элементы по блокам'
    : `${APP_NAME} · ${store?.activeEntity?.name ?? DEFAULT_ENTITY_NAME}`,
);

const subtitle = computed(() => {
  if (initFailed.value) return 'Ошибка загрузки';
  if (variant.value === 'elements') return '5 модулей · сводный перечень';
  const current = tab.value;
  if (current !== null && current >= 0 && current <= 2)
    return PROGRAM[current]?.name ?? 'Программа занятий';
  if (current === 3) return 'Поиск';
  return 'Программа занятий';
});

function onSelect(index: number): void {
  router.push(routeForTab(index));
}

watch(tab, (next, prev) => {
  if (next === null) return;
  if (store && next !== store.savedTab) store.setTab(next);
  if (prev != null && prev !== next) {
    dismiss();
    mainRef.value?.scrollTo(0, 0);
  }
});
</script>

<template>
  <!-- open-menu is handled in stage 8 (SideMenu) -->
  <AppHeader :title="title" :subtitle="subtitle" :variant="variant" />
  <InstallHint :visible="isVisible" @close="dismiss" />
  <div class="app" :class="{ 'is-tabs-hidden': route.meta.hideTabs }">
    <main ref="main" class="app__main">
      <RouterView v-if="!initFailed" />
    </main>
  </div>
  <BottomTabs v-if="!route.meta.hideTabs" :active-tab="tab" @select="onSelect" />
  <AppToast />
</template>

<style scoped src="./App.css"></style>
