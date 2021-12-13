import i18n from 'i18next';
import translation from './en/translation.en.json';
import { initReactI18next } from 'react-i18next';

export const resources = {
  en: {
    translation,
  },
} as const;

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources,
  interpolation: {
    format: function (value, format, _lng) {
      if (format === 'lowercase') return value.toLowerCase();
    },
  },
});

export default i18n;
