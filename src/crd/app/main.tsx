import i18n from 'i18next';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { crdTranslations } from '@/crd/i18n/translations';
import '@/crd/styles/crd.css';
import { CrdApp } from './CrdApp';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        crd: crdTranslations,
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

createRoot(document.getElementById('root')!).render(<CrdApp />);
