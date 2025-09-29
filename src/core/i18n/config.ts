import i18n from 'i18next';
import 'react-i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { env } from '@/main/env';
import { namespaces } from './namespaces';

export const defaultNS = 'common';
export const allNamespaces = Object.values(namespaces);

const defaultLang = 'en';
export const supportedLngs = [defaultLang, 'nl', 'es', 'bg', 'de', 'fr', 'pt'];

if (env?.VITE_APP_IN_CONTEXT_TRANSLATION === 'true') {
  supportedLngs.push('inContextTool');
}

// Lazy loading function for namespace translations using dynamic imports
const loadNamespaceTranslation = async (lng: string, namespace: string) => {
  try {
    switch (lng) {
      case 'es':
        return (await import(`./es/namespaces/${namespace}.json`)).default;
      case 'nl':
        return (await import(`./nl/namespaces/${namespace}.json`)).default;
      case 'bg':
        return (await import(`./bg/namespaces/${namespace}.json`)).default;
      case 'de':
        return (await import(`./de/namespaces/${namespace}.json`)).default;
      case 'fr':
        return (await import(`./fr/namespaces/${namespace}.json`)).default;
      case 'pt':
        return (await import(`./pt/namespaces/${namespace}.json`)).default;
      case 'inContextTool':
        return (await import(`./ach/namespaces/${namespace}.json`)).default;
      default:
        return (await import(`./en/namespaces/${namespace}.json`)).default;
    }
  } catch (error) {
    console.error(`Failed to load ${namespace} translation for language: ${lng}`, error);
    // Fallback to English if loading fails
    try {
      return (await import(`./en/namespaces/${namespace}.json`)).default;
    } catch (fallbackError) {
      console.error(`Failed to load ${namespace} fallback translation`, fallbackError);
      return {};
    }
  }
};

// Legacy loading function for backward compatibility with monolithic translation files
const loadLegacyTranslation = async (lng: string) => {
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
      case 'pt':
        return (await import('./pt/translation.pt.json')).default;
      case 'inContextTool':
        return (await import('./ach/translation.ach.json')).default;
      default:
        return (await import('./en/translation.en.json')).default;
    }
  } catch (error) {
    console.error(`Failed to load legacy translation for language: ${lng}`, error);
    return {};
  }
};

// Cache for loaded translations
const translationCache = new Map<string, Record<string, unknown>>();

// Custom backend for lazy loading with namespace support
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
      let translation: Record<string, unknown>;
      
      // Try loading from namespace files first
      if ((Object.values(namespaces) as string[]).includes(namespace)) {
        translation = await loadNamespaceTranslation(language, namespace);
      } else {
        // Fallback to legacy translation loading for backward compatibility
        // This handles the default 'translation' namespace
        const legacyTranslation = await loadLegacyTranslation(language);
        translation = legacyTranslation;
      }
      
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
    ns: allNamespaces,
    defaultNS,
    preload: [defaultLang], // Only preload English
    interpolation: {
      format: (value, format, _lng) => {
        if (format === 'lowercase') return value.toLowerCase();
      },
      escapeValue: false, // React already protects from XSS unless you use dangerouslySetInnerHTML (which we shouldn't)
    },
  });

export default i18n;
