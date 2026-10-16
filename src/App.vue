<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from '@/components/AppHeader/AppHeader.vue';
import AppToast from '@/components/AppToast/AppToast.vue';
import BottomTabs from '@/components/BottomTabs/BottomTabs.vue';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog.vue';
import EntitiesSheet from '@/components/EntitiesSheet/EntitiesSheet.vue';
import EntityForm from '@/components/EntityForm/EntityForm.vue';
import InfoSheet from '@/components/InfoSheet/InfoSheet.vue';
import InstallHint from '@/components/InstallHint/InstallHint.vue';
import SideMenu from '@/components/SideMenu/SideMenu.vue';
import type { MenuAction } from '@/components/SideMenu/SideMenu.vue';
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
