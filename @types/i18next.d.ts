import 'i18next';
import { defaultNS } from '@/core/i18n/config';
import type enTranslation from '@/core/i18n/en/translation.en.json';
import type crdLayoutTranslation from '@/crd/i18n/layout/layout.en.json';
import type crdCommonTranslation from '@/crd/i18n/common/common.en.json';
import type crdExploreSpacesTranslation from '@/crd/i18n/exploreSpaces/exploreSpaces.en.json';
import type crdNotificationsTranslation from '@/crd/i18n/notifications/notifications.en.json';
import type crdDashboardTranslation from '@/crd/i18n/dashboard/dashboard.en.json';
import type crdSpaceTranslation from '@/crd/i18n/space/space.en.json';
import type crdSearchTranslation from '@/crd/i18n/search/search.en.json';
import type crdMarkdownTranslation from '@/crd/i18n/markdown/markdown.en.json';
import type crdSpaceSettingsTranslation from '@/crd/i18n/spaceSettings/spaceSettings.en.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: {
      translation: typeof enTranslation;
      'crd-layout': typeof crdLayoutTranslation;
      'crd-common': typeof crdCommonTranslation;
      'crd-exploreSpaces': typeof crdExploreSpacesTranslation;
      'crd-notifications': typeof crdNotificationsTranslation;
      'crd-dashboard': typeof crdDashboardTranslation;
      'crd-space': typeof crdSpaceTranslation;
      'crd-search': typeof crdSearchTranslation;
      'crd-markdown': typeof crdMarkdownTranslation;
      'crd-spaceSettings': typeof crdSpaceSettingsTranslation;
    };
  }
}
