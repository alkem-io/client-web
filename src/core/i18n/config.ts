import i18n from 'i18next';
import 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
// CRD layout namespace — eagerly loaded (renders on every CRD page)
import crdLayoutEN from '@/crd/i18n/layout/layout.en.json';
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
  } catch (_error) {
    // Fallback to English
    return translationEN;
  }
};

// Registry of CRD namespace imports for lazy loading
// Each namespace maps language codes to dynamic import functions.
// English layout is eagerly loaded; all other CRD namespaces are lazy-loaded.
const crdNamespaceImports: Record<string, Record<string, () => Promise<{ default: Record<string, unknown> }>>> = {
  'crd-layout': {
    en: () => import('@/crd/i18n/layout/layout.en.json'),
    es: () => import('@/crd/i18n/layout/layout.es.json'),
    nl: () => import('@/crd/i18n/layout/layout.nl.json'),
    bg: () => import('@/crd/i18n/layout/layout.bg.json'),
    de: () => import('@/crd/i18n/layout/layout.de.json'),
    fr: () => import('@/crd/i18n/layout/layout.fr.json'),
  },
  'crd-common': {
    en: () => import('@/crd/i18n/common/common.en.json'),
    es: () => import('@/crd/i18n/common/common.es.json'),
    nl: () => import('@/crd/i18n/common/common.nl.json'),
    bg: () => import('@/crd/i18n/common/common.bg.json'),
    de: () => import('@/crd/i18n/common/common.de.json'),
    fr: () => import('@/crd/i18n/common/common.fr.json'),
  },
  'crd-exploreSpaces': {
    en: () => import('@/crd/i18n/exploreSpaces/exploreSpaces.en.json'),
    es: () => import('@/crd/i18n/exploreSpaces/exploreSpaces.es.json'),
    nl: () => import('@/crd/i18n/exploreSpaces/exploreSpaces.nl.json'),
    bg: () => import('@/crd/i18n/exploreSpaces/exploreSpaces.bg.json'),
    de: () => import('@/crd/i18n/exploreSpaces/exploreSpaces.de.json'),
    fr: () => import('@/crd/i18n/exploreSpaces/exploreSpaces.fr.json'),
  },
  'crd-notifications': {
    en: () => import('@/crd/i18n/notifications/notifications.en.json'),
    es: () => import('@/crd/i18n/notifications/notifications.es.json'),
    nl: () => import('@/crd/i18n/notifications/notifications.nl.json'),
    bg: () => import('@/crd/i18n/notifications/notifications.bg.json'),
    de: () => import('@/crd/i18n/notifications/notifications.de.json'),
    fr: () => import('@/crd/i18n/notifications/notifications.fr.json'),
  },
  'crd-dashboard': {
    en: () => import('@/crd/i18n/dashboard/dashboard.en.json'),
    es: () => import('@/crd/i18n/dashboard/dashboard.es.json'),
    nl: () => import('@/crd/i18n/dashboard/dashboard.nl.json'),
    bg: () => import('@/crd/i18n/dashboard/dashboard.bg.json'),
    de: () => import('@/crd/i18n/dashboard/dashboard.de.json'),
    fr: () => import('@/crd/i18n/dashboard/dashboard.fr.json'),
  },
  'crd-space': {
    en: () => import('@/crd/i18n/space/space.en.json'),
    es: () => import('@/crd/i18n/space/space.es.json'),
    nl: () => import('@/crd/i18n/space/space.nl.json'),
    bg: () => import('@/crd/i18n/space/space.bg.json'),
    de: () => import('@/crd/i18n/space/space.de.json'),
    fr: () => import('@/crd/i18n/space/space.fr.json'),
  },
  'crd-markdown': {
    en: () => import('@/crd/i18n/markdown/markdown.en.json'),
    es: () => import('@/crd/i18n/markdown/markdown.es.json'),
    nl: () => import('@/crd/i18n/markdown/markdown.nl.json'),
    bg: () => import('@/crd/i18n/markdown/markdown.bg.json'),
    de: () => import('@/crd/i18n/markdown/markdown.de.json'),
    fr: () => import('@/crd/i18n/markdown/markdown.fr.json'),
  },
  'crd-search': {
    en: () => import('@/crd/i18n/search/search.en.json'),
    es: () => import('@/crd/i18n/search/search.es.json'),
    nl: () => import('@/crd/i18n/search/search.nl.json'),
    bg: () => import('@/crd/i18n/search/search.bg.json'),
    de: () => import('@/crd/i18n/search/search.de.json'),
    fr: () => import('@/crd/i18n/search/search.fr.json'),
  },
  'crd-spaceSettings': {
    en: () => import('@/crd/i18n/spaceSettings/spaceSettings.en.json'),
    es: () => import('@/crd/i18n/spaceSettings/spaceSettings.es.json'),
    nl: () => import('@/crd/i18n/spaceSettings/spaceSettings.nl.json'),
    bg: () => import('@/crd/i18n/spaceSettings/spaceSettings.bg.json'),
    de: () => import('@/crd/i18n/spaceSettings/spaceSettings.de.json'),
    fr: () => import('@/crd/i18n/spaceSettings/spaceSettings.fr.json'),
  },
  'crd-whiteboard': {
    en: () => import('@/crd/i18n/whiteboard/whiteboard.en.json'),
    es: () => import('@/crd/i18n/whiteboard/whiteboard.es.json'),
    nl: () => import('@/crd/i18n/whiteboard/whiteboard.nl.json'),
    bg: () => import('@/crd/i18n/whiteboard/whiteboard.bg.json'),
    de: () => import('@/crd/i18n/whiteboard/whiteboard.de.json'),
    fr: () => import('@/crd/i18n/whiteboard/whiteboard.fr.json'),
  },
};

// Cache for loaded translations
const translationCache = new Map<string, Record<string, unknown>>();
// Pre-populate cache with eagerly loaded English translations
translationCache.set(`${defaultLang}-${defaultNS}`, translationEN);
translationCache.set(`${defaultLang}-crd-layout`, crdLayoutEN);

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
      let translation: Record<string, unknown>;

      if (namespace === 'translation') {
        translation = await loadTranslation(language);
      } else if (crdNamespaceImports[namespace]) {
        const langImports = crdNamespaceImports[namespace];
        if (langImports[language]) {
          translation = (await langImports[language]()).default;
        } else {
          // Namespace exists but no import for this language — return empty
          translation = {};
        }
      } else {
        return callback(new Error(`Unknown namespace: ${namespace}`));
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
    ns: [defaultNS, 'crd-layout'],
    defaultNS,
    preload: [defaultLang], // English is preloaded
    // Required when mixing bundled resources with a backend for other languages
    partialBundledLanguages: true,
    // Add English translations as initial resources for instant availability
    resources: {
      en: {
        translation: translationEN,
        'crd-layout': crdLayoutEN,
      },
    },
    interpolation: {
      format: (value, format, _lng) => {
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'capitalize') return value.charAt(0).toUpperCase() + value.slice(1);
        if (format === 'uppercase') return value.toUpperCase();
      },
      escapeValue: false, // React already protects from XSS unless you use dangerouslySetInnerHTML (which we shouldn't)
    },
  });

export default i18n;
