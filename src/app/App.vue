<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from './layout/AppHeader/AppHeader.vue';
import AppToast from '@/shared/ui/AppToast/AppToast.vue';
import BottomTabs from './layout/BottomTabs/BottomTabs.vue';
import ConfirmDialog from '@/shared/ui/ConfirmDialog/ConfirmDialog.vue';
import InfoSheet from './layout/InfoSheet/InfoSheet.vue';
import SideMenu from './layout/SideMenu/SideMenu.vue';
import type { MenuAction } from './layout/SideMenu/SideMenu.vue';
import { useStandalone } from '@/shared/composables/useStandalone';
import { useToast } from '@/shared/composables/useToast';
import { APP_NAME } from '@/shared/config/app-meta';
import { PROGRAM } from '@/modules/program';
import { ERROR_CODES } from '@/shared/lib/errors';
import { routeForTab, tabFromRoute } from './router';
import {
  DEFAULT_ENTITY_NAME,
  EntitiesSheet,
  EntityForm,
  useProfilesStore,
} from '@/modules/profiles';
import { InstallHint, useInstallHint } from '@/modules/pwa';

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

const isMenuOpen = ref(false);
const isInfoOpen = ref(false);
const isEntitiesOpen = ref(false);
const isFormOpen = ref(false);
const formEntityId = ref<string | null>(null);
const isResetOpen = ref(false);

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

const resetMessage = computed(
  () => `Сбросить прогресс для «${store?.activeEntity?.name ?? DEFAULT_ENTITY_NAME}»?`,
);

function onMenuSelect(action: MenuAction): void {
  if (action === 'entities') isEntitiesOpen.value = true;
  else if (action === 'info') isInfoOpen.value = true;
  else if (action === 'reset') isResetOpen.value = true;
  else {
    formEntityId.value = null;
    isFormOpen.value = true;
  }
}

function onEdit(id: string): void {
  isEntitiesOpen.value = false;
  formEntityId.value = id;
  isFormOpen.value = true;
}

function onResetConfirm(): void {
  store?.clearProgress();
  toast.show('Прогресс сброшен');
}

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
  <AppHeader
    :title="title"
    :subtitle="subtitle"
    :variant="variant"
    @open-menu="isMenuOpen = true"
  />
  <InstallHint :visible="isVisible" @close="dismiss" />
  <div class="app" :class="{ 'is-tabs-hidden': route.meta.hideTabs }">
    <main ref="main" class="app__main">
      <RouterView v-if="!initFailed" />
    </main>
  </div>
  <BottomTabs v-if="!route.meta.hideTabs" :active-tab="tab" @select="onSelect" />
  <AppToast />
  <template v-if="!initFailed">
    <SideMenu v-model:open="isMenuOpen" @select="onMenuSelect" />
    <InfoSheet v-model:open="isInfoOpen" />
    <EntitiesSheet v-model:open="isEntitiesOpen" @edit="onEdit" />
    <EntityForm v-model:open="isFormOpen" :entity-id="formEntityId" />
    <ConfirmDialog
      v-model:open="isResetOpen"
      :message="resetMessage"
      confirm-label="Сбросить"
      @confirm="onResetConfirm"
    />
  </template>
</template>

<style scoped src="./App.css"></style>
