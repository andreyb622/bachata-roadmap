import { formatVersionLabel } from '@/shared/lib/version';

export const APP_NAME = 'Bachata Roadmap';
export const APP_SHORT_NAME = 'Roadmap';

export const APP_VERSION_LABEL = formatVersionLabel(
  __APP_VERSION__,
  __BUILD_DATE__,
  __BUILD_COMMIT__,
);
