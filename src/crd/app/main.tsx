import i18n from 'i18next';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import crdEN from '@/crd/i18n/components.en.json';
import '@/crd/styles/crd.css';
import { CrdApp } from './CrdApp';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      crd: crdEN,
    },
  },
  lng: 'en',
  ns: ['crd'],
  defaultNS: 'crd',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

createRoot(document.getElementById('root')!).render(<CrdApp />);
