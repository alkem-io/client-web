import i18n from 'i18next';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import crdCommonEN from '@/crd/i18n/common/common.en.json';
import crdDashboardEN from '@/crd/i18n/dashboard/dashboard.en.json';
import crdExploreSpacesEN from '@/crd/i18n/exploreSpaces/exploreSpaces.en.json';
import crdLayoutEN from '@/crd/i18n/layout/layout.en.json';
import crdSpaceEN from '@/crd/i18n/space/space.en.json';
import '@/crd/styles/crd.css';
import { CrdApp } from './CrdApp';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      'crd-layout': crdLayoutEN,
      'crd-common': crdCommonEN,
      'crd-exploreSpaces': crdExploreSpacesEN,
      'crd-dashboard': crdDashboardEN,
      'crd-space': crdSpaceEN
    },
  },
  lng: 'en',
  ns: ['crd-layout', 'crd-common', 'crd-exploreSpaces', 'crd-dashboard', 'crd-space'],
  defaultNS: 'crd-layout',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

createRoot(document.getElementById('root')!).render(<CrdApp />);
