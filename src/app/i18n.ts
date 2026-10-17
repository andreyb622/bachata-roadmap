import { createAppI18n, sharedEn, sharedEs } from '@/shared/i18n';
import sharedRu from '@/shared/i18n/ru';
import { setActiveI18n } from '@/shared/i18n/translate';
import { profilesEn, profilesEs, profilesRu } from '@/modules/profiles';
import { pwaEn, pwaEs, pwaRu } from '@/modules/pwa';
import { searchEn, searchEs, searchRu } from '@/modules/search';
import { settingsEn, settingsEs, settingsRu } from '@/modules/settings';
import appEn from './i18n/en';
import appEs from './i18n/es';
import appRu from './i18n/ru';

export const i18n = createAppI18n({
  ru: { ...sharedRu, ...appRu, ...profilesRu, ...settingsRu, ...pwaRu, ...searchRu },
  en: { ...sharedEn, ...appEn, ...profilesEn, ...settingsEn, ...pwaEn, ...searchEn },
  es: { ...sharedEs, ...appEs, ...profilesEs, ...settingsEs, ...pwaEs, ...searchEs },
});

setActiveI18n(i18n);
