import type { Locale } from 'date-fns';
import { bg, de, enUS, es, fr, nl } from 'date-fns/locale';

/**
 * Maps i18next language codes to date-fns Locale objects.
 *
 * The set is intentionally pinned to the languages declared in
 * `src/core/i18n/config.ts` `supportedLngs` (en, nl, es, bg, de, fr). Any new
 * supported language MUST be added here so calendar formatting (month names,
 * weekday headers, AM/PM markers, relative-date phrases) localises correctly.
 */
const LOCALE_BY_LANG: Record<string, Locale> = {
  en: enUS,
  nl,
  es,
  bg,
  de,
  fr,
};

/**
 * Resolves an i18next language code (e.g. "de", "en-US") to a date-fns Locale.
 * Falls back to en-US for unknown codes. Strips region tags so "en-US" → enUS,
 * "de-AT" → de, etc.
 */
export function resolveDateFnsLocale(langCode: string | undefined): Locale {
  if (!langCode) return enUS;
  const base = langCode.split('-')[0];
  return LOCALE_BY_LANG[base] ?? enUS;
}
