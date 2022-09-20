import i18n from 'i18next';
import translationEn from './en/translation.en.json';
import translationEs from './es/translation.es.json';
import translationNl from './nl/translation.nl.json';
import translationBg from './bg/translation.bg.json';
import translationUa from './ua/translation.ua.json';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const resources = {
  en: {
    translation: translationEn,
  },
  nl: {
    translation: translationNl,
  },
  es: {
    translation: translationEs,
  },
  bg: {
    translation: translationBg,
  },
  ua: {
    translation: translationUa,
  },
} as const;

type Language = keyof typeof resources;

export const supportedLngs: Language[] = ['en', 'nl', 'es', 'bg', 'ua'];

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: supportedLngs[0],
    supportedLngs,
    resources,
    interpolation: {
      format: function (value, format, _lng) {
        if (format === 'lowercase') return value.toLowerCase();
      },
    },
  });

export default i18n;
