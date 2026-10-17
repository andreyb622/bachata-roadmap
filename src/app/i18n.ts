import { createAppI18n } from '@/shared/i18n';
import sharedRu from '@/shared/i18n/ru';
import { setActiveI18n } from '@/shared/i18n/translate';
import { profilesRu } from '@/modules/profiles';
import { pwaRu } from '@/modules/pwa';
import { searchRu } from '@/modules/search';
import { settingsRu } from '@/modules/settings';
import appRu from './i18n/ru';

export const i18n = createAppI18n({
  ru: { ...sharedRu, ...appRu, ...profilesRu, ...settingsRu, ...pwaRu, ...searchRu },
});

setActiveI18n(i18n);
