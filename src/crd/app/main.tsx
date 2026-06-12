import i18n from 'i18next';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import crdCommonEN from '@/crd/i18n/common/common.en.json';
import crdDashboardEN from '@/crd/i18n/dashboard/dashboard.en.json';
import crdExploreSpacesEN from '@/crd/i18n/exploreSpaces/exploreSpaces.en.json';
import crdLayoutEN from '@/crd/i18n/layout/layout.en.json';
import crdSpaceEN from '@/crd/i18n/space/space.en.json';
import crdSpaceSettingsEN from '@/crd/i18n/spaceSettings/spaceSettings.en.json';
import crdSubspaceEN from '@/crd/i18n/subspace/subspace.en.json';
import crdCreateSpaceEN from '@/crd/i18n/createSpace/createSpace.en.json';
import crdMarkdownEN from '@/crd/i18n/markdown/markdown.en.json';
import crdNotificationsEN from '@/crd/i18n/notifications/notifications.en.json';
import crdProfilePagesEN from '@/crd/i18n/profilePages/profilePages.en.json';
import crdTemplatesEN from '@/crd/i18n/templates/templates.en.json';
import '@/crd/styles/crd.css';
import { CrdApp } from './CrdApp';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      'crd-layout': crdLayoutEN,
      'crd-common': crdCommonEN,
      'crd-exploreSpaces': crdExploreSpacesEN,
      'crd-dashboard': crdDashboardEN,
      'crd-space': crdSpaceEN,
      'crd-spaceSettings': crdSpaceSettingsEN,
      'crd-subspace': crdSubspaceEN,
      'crd-createSpace': crdCreateSpaceEN,
      'crd-markdown': crdMarkdownEN,
      'crd-notifications': crdNotificationsEN,
      'crd-profilePages': crdProfilePagesEN,
      'crd-templates': crdTemplatesEN,
    },
  },
  lng: 'en',
  ns: [
    'crd-layout',
    'crd-common',
    'crd-exploreSpaces',
    'crd-dashboard',
    'crd-space',
    'crd-spaceSettings',
    'crd-subspace',
    'crd-createSpace',
    'crd-markdown',
    'crd-notifications',
    'crd-profilePages',
    'crd-templates',
  ],
  defaultNS: 'crd-layout',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

createRoot(document.getElementById('root')!).render(<CrdApp />);
