import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEn from './en/translation.en.json';
import translationEs from './es/translation.es.json';
import translationNl from './nl/translation.nl.json';
import translationBg from './bg/translation.bg.json';
import translationUa from './ua/translation.ua.json';
import translationDe from './de/translation.de.json';
import translationFr from './fr/translation.fr.json';
import inContextTranslation from './ach/translation.ach.json';
import { env } from '../../main/env';

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
  de: {
    translation: translationDe,
  },
  fr: {
    translation: translationFr,
  },
  inContextTool: {
    translation: inContextTranslation,
  },
} as const;

type Language = keyof typeof resources;

export const supportedLngs: Language[] = ['en', 'nl', 'es', 'bg', 'ua', 'de', 'fr'];

if (env?.REACT_APP_IN_CONTEXT_TRANSLATION === 'true') {
  supportedLngs.push('inContextTool');
}

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
