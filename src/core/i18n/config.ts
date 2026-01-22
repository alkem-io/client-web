import i18n from 'i18next';
import 'react-i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { env } from '@/main/env';
// Eagerly import default English translation to bundle it with main chunk
import translationEN from './en/translation.en.json';

export const defaultNS = 'translation';

const defaultLang = 'en';
type SupportedLang = 'en' | 'nl' | 'es' | 'bg' | 'de' | 'fr';
export const supportedLngs: (SupportedLang | 'inContextTool')[] = [defaultLang, 'nl', 'es', 'bg', 'de', 'fr'];

if (env?.VITE_APP_IN_CONTEXT_TRANSLATION === 'true') {
  supportedLngs.push('inContextTool');
}

// Lazy loading function for translations using dynamic imports
// English is eagerly loaded above for better initial page performance
const loadTranslation = async (lng: string) => {
  try {
    switch (lng) {
      case 'es':
        return (await import('./es/translation.es.json')).default;
      case 'nl':
        return (await import('./nl/translation.nl.json')).default;
      case 'bg':
        return (await import('./bg/translation.bg.json')).default;
      case 'de':
        return (await import('./de/translation.de.json')).default;
      case 'fr':
        return (await import('./fr/translation.fr.json')).default;
      // case 'pt':
      //    return (await import('./pt/translation.pt.json')).default;
      case 'inContextTool':
        return (await import('./ach/translation.ach.json')).default;
      default:
        // Return eagerly loaded English translation
        return translationEN;
    }
  } catch (error) {
    console.error(`Failed to load translation for language: ${lng}`, error);
    // Fallback to English
    return translationEN;
  }
};

// Cache for loaded translations
const translationCache = new Map<string, Record<string, unknown>>();
// Pre-populate cache with eagerly loaded English translation
translationCache.set(`${defaultLang}-${defaultNS}`, translationEN);

// Custom backend for lazy loading
const lazyBackend = {
  type: 'backend' as const,
  init: () => {},
  read: async (
    language: string,
    namespace: string,
    callback: (err: Error | null, data?: Record<string, unknown>) => void
  ) => {
    const cacheKey = `${language}-${namespace}`;

    // Check cache first
    if (translationCache.has(cacheKey)) {
      return callback(null, translationCache.get(cacheKey));
    }

    try {
      const translation = await loadTranslation(language);
      translationCache.set(cacheKey, translation);
      callback(null, translation);
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)));
    }
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(lazyBackend)
  .init({
    fallbackLng: defaultLang,
    supportedLngs,
    ns: [defaultNS],
    defaultNS,
    preload: [defaultLang], // English is preloaded
    // Required when mixing bundled resources with a backend for other languages
    partialBundledLanguages: true,
    // Add English translations as initial resources for instant availability
    resources: {
      en: {
        translation: translationEN,
      },
    },
    interpolation: {
      format: (value, format, _lng) => {
        if (format === 'lowercase') return value.toLowerCase();
      },
      escapeValue: false, // React already protects from XSS unless you use dangerouslySetInnerHTML (which we shouldn't)
    },
  });

export default i18n;
