import i18n from 'i18next';
import 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
// CRD error namespace — eagerly loaded so the top-level (above-router) error
// boundary can render a CRD error page even when a crash happens at boot,
// before the lazy backend has a chance to fetch it.
import crdErrorEN from '@/crd/i18n/error/error.en.json';
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
  'crd-error': {
    en: () => import('@/crd/i18n/error/error.en.json'),
    es: () => import('@/crd/i18n/error/error.es.json'),
    nl: () => import('@/crd/i18n/error/error.nl.json'),
    bg: () => import('@/crd/i18n/error/error.bg.json'),
    de: () => import('@/crd/i18n/error/error.de.json'),
    fr: () => import('@/crd/i18n/error/error.fr.json'),
  },
  'crd-auth': {
    en: () => import('@/crd/i18n/auth/auth.en.json'),
    es: () => import('@/crd/i18n/auth/auth.es.json'),
    nl: () => import('@/crd/i18n/auth/auth.nl.json'),
    bg: () => import('@/crd/i18n/auth/auth.bg.json'),
    de: () => import('@/crd/i18n/auth/auth.de.json'),
    fr: () => import('@/crd/i18n/auth/auth.fr.json'),
  },
  'crd-spaceSettings': {
    en: () => import('@/crd/i18n/spaceSettings/spaceSettings.en.json'),
    es: () => import('@/crd/i18n/spaceSettings/spaceSettings.es.json'),
    nl: () => import('@/crd/i18n/spaceSettings/spaceSettings.nl.json'),
    bg: () => import('@/crd/i18n/spaceSettings/spaceSettings.bg.json'),
    de: () => import('@/crd/i18n/spaceSettings/spaceSettings.de.json'),
    fr: () => import('@/crd/i18n/spaceSettings/spaceSettings.fr.json'),
  },
  'crd-community': {
    en: () => import('@/crd/i18n/community/community.en.json'),
    es: () => import('@/crd/i18n/community/community.es.json'),
    nl: () => import('@/crd/i18n/community/community.nl.json'),
    bg: () => import('@/crd/i18n/community/community.bg.json'),
    de: () => import('@/crd/i18n/community/community.de.json'),
    fr: () => import('@/crd/i18n/community/community.fr.json'),
  },
  'crd-subspace': {
    en: () => import('@/crd/i18n/subspace/subspace.en.json'),
    es: () => import('@/crd/i18n/subspace/subspace.es.json'),
    nl: () => import('@/crd/i18n/subspace/subspace.nl.json'),
    bg: () => import('@/crd/i18n/subspace/subspace.bg.json'),
    de: () => import('@/crd/i18n/subspace/subspace.de.json'),
    fr: () => import('@/crd/i18n/subspace/subspace.fr.json'),
  },
  'crd-createSpace': {
    en: () => import('@/crd/i18n/createSpace/createSpace.en.json'),
    es: () => import('@/crd/i18n/createSpace/createSpace.es.json'),
    nl: () => import('@/crd/i18n/createSpace/createSpace.nl.json'),
    bg: () => import('@/crd/i18n/createSpace/createSpace.bg.json'),
    de: () => import('@/crd/i18n/createSpace/createSpace.de.json'),
    fr: () => import('@/crd/i18n/createSpace/createSpace.fr.json'),
  },
  'crd-whiteboard': {
    en: () => import('@/crd/i18n/whiteboard/whiteboard.en.json'),
    es: () => import('@/crd/i18n/whiteboard/whiteboard.es.json'),
    nl: () => import('@/crd/i18n/whiteboard/whiteboard.nl.json'),
    bg: () => import('@/crd/i18n/whiteboard/whiteboard.bg.json'),
    de: () => import('@/crd/i18n/whiteboard/whiteboard.de.json'),
    fr: () => import('@/crd/i18n/whiteboard/whiteboard.fr.json'),
  },
  'crd-forum': {
    en: () => import('@/crd/i18n/forum/forum.en.json'),
    es: () => import('@/crd/i18n/forum/forum.es.json'),
    nl: () => import('@/crd/i18n/forum/forum.nl.json'),
    bg: () => import('@/crd/i18n/forum/forum.bg.json'),
    de: () => import('@/crd/i18n/forum/forum.de.json'),
    fr: () => import('@/crd/i18n/forum/forum.fr.json'),
  },
  'crd-documentation': {
    en: () => import('@/crd/i18n/documentation/documentation.en.json'),
    es: () => import('@/crd/i18n/documentation/documentation.es.json'),
    nl: () => import('@/crd/i18n/documentation/documentation.nl.json'),
    bg: () => import('@/crd/i18n/documentation/documentation.bg.json'),
    de: () => import('@/crd/i18n/documentation/documentation.de.json'),
    fr: () => import('@/crd/i18n/documentation/documentation.fr.json'),
  },
  'crd-profilePages': {
    en: () => import('@/crd/i18n/profilePages/profilePages.en.json'),
    es: () => import('@/crd/i18n/profilePages/profilePages.es.json'),
    nl: () => import('@/crd/i18n/profilePages/profilePages.nl.json'),
    bg: () => import('@/crd/i18n/profilePages/profilePages.bg.json'),
    de: () => import('@/crd/i18n/profilePages/profilePages.de.json'),
    fr: () => import('@/crd/i18n/profilePages/profilePages.fr.json'),
  },
  'crd-templates': {
    en: () => import('@/crd/i18n/templates/templates.en.json'),
    es: () => import('@/crd/i18n/templates/templates.es.json'),
    nl: () => import('@/crd/i18n/templates/templates.nl.json'),
    bg: () => import('@/crd/i18n/templates/templates.bg.json'),
    de: () => import('@/crd/i18n/templates/templates.de.json'),
    fr: () => import('@/crd/i18n/templates/templates.fr.json'),
  },
  'crd-contributorSettings': {
    en: () => import('@/crd/i18n/contributorSettings/contributorSettings.en.json'),
    es: () => import('@/crd/i18n/contributorSettings/contributorSettings.es.json'),
    nl: () => import('@/crd/i18n/contributorSettings/contributorSettings.nl.json'),
    bg: () => import('@/crd/i18n/contributorSettings/contributorSettings.bg.json'),
    de: () => import('@/crd/i18n/contributorSettings/contributorSettings.de.json'),
    fr: () => import('@/crd/i18n/contributorSettings/contributorSettings.fr.json'),
  },
  'crd-innovationHub': {
    en: () => import('@/crd/i18n/innovationHub/innovationHub.en.json'),
    es: () => import('@/crd/i18n/innovationHub/innovationHub.es.json'),
    nl: () => import('@/crd/i18n/innovationHub/innovationHub.nl.json'),
    bg: () => import('@/crd/i18n/innovationHub/innovationHub.bg.json'),
    de: () => import('@/crd/i18n/innovationHub/innovationHub.de.json'),
    fr: () => import('@/crd/i18n/innovationHub/innovationHub.fr.json'),
  },
  'crd-admin': {
    en: () => import('@/crd/i18n/admin/admin.en.json'),
    es: () => import('@/crd/i18n/admin/admin.es.json'),
    nl: () => import('@/crd/i18n/admin/admin.nl.json'),
    bg: () => import('@/crd/i18n/admin/admin.bg.json'),
    de: () => import('@/crd/i18n/admin/admin.de.json'),
    fr: () => import('@/crd/i18n/admin/admin.fr.json'),
  },
  'crd-help': {
    en: () => import('@/crd/i18n/help/help.en.json'),
    es: () => import('@/crd/i18n/help/help.es.json'),
    nl: () => import('@/crd/i18n/help/help.nl.json'),
    bg: () => import('@/crd/i18n/help/help.bg.json'),
    de: () => import('@/crd/i18n/help/help.de.json'),
    fr: () => import('@/crd/i18n/help/help.fr.json'),
  },
};

// Cache for loaded translations
const translationCache = new Map<string, Record<string, unknown>>();
// Pre-populate cache with eagerly loaded English translations
translationCache.set(`${defaultLang}-${defaultNS}`, translationEN);
translationCache.set(`${defaultLang}-crd-layout`, crdLayoutEN);
translationCache.set(`${defaultLang}-crd-error`, crdErrorEN);

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
    ns: [defaultNS, 'crd-layout', 'crd-error'],
    defaultNS,
    preload: [defaultLang], // English is preloaded
    // Required when mixing bundled resources with a backend for other languages
    partialBundledLanguages: true,
    // Add English translations as initial resources for instant availability
    resources: {
      en: {
        translation: translationEN,
        'crd-layout': crdLayoutEN,
        'crd-error': crdErrorEN,
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
