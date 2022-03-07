import i18n from 'i18next';
import translationEn from './en/translation.en.json';
import translationNl from './nl/translation.nl.json';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const resources = {
  en: {
    translation: translationEn,
  },
  nl: {
    translation: translationNl,
  },
} as const;

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'nl', // todo: revert to en before pushing this to develop
    supportedLngs: ['en', 'nl'],
    resources,
    interpolation: {
      format: function (value, format, _lng) {
        if (format === 'lowercase') return value.toLowerCase();
      },
    },
  });

export default i18n;
