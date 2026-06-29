import type { Locale } from 'date-fns';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Reusable date/time formatters for the CRD layer. Three variants — pick the
 * one whose semantics match the surface:
 *
 * - `formatAbsoluteDateTime` — comments, audit logs, anything that benefits
 *   from a precise timestamp ("13/05/2026, 15:51:44"). Mirrors MUI's
 *   `toLocaleString`-driven comment timestamp.
 * - `formatRelativeFromNow` — preview headers, "X ago" affordances where the
 *   approximate distance is more useful than the precise time. Equivalent to
 *   MUI's `formatTimeElapsed('long')` ("about 1 hour ago", "less than a minute ago").
 * - `formatShortDate` — list views / cards where only the day matters
 *   ("13/05/2026").
 *
 * All three accept an optional `date-fns` Locale (resolve via
 * `resolveDateFnsLocale(i18n.language)` from `@/crd/lib/dateFnsLocale`). The
 * locale is purely advisory — when omitted the function falls back to
 * `date-fns`'s built-in English locale.
 */

const toDate = (input: Date | string | number | null | undefined): Date | undefined => {
  if (input === null || input === undefined) return undefined;
  const parsed = input instanceof Date ? input : new Date(input);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

/** "13/05/2026, 15:51:44" — locale-aware date + 24h time, second-precision. */
export function formatAbsoluteDateTime(
  input: Date | string | number | null | undefined,
  locale?: Locale
): string | undefined {
  const date = toDate(input);
  if (!date) return undefined;
  return format(date, 'P, HH:mm:ss', locale ? { locale } : undefined);
}

/** "about 1 hour ago", "less than a minute ago", "5 days ago". */
export function formatRelativeFromNow(
  input: Date | string | number | null | undefined,
  locale?: Locale
): string | undefined {
  const date = toDate(input);
  if (!date) return undefined;
  return formatDistanceToNow(date, { addSuffix: true, ...(locale ? { locale } : {}) });
}

/** "13/05/2026" — locale-aware short date, no time component. */
export function formatShortDate(input: Date | string | number | null | undefined, locale?: Locale): string | undefined {
  const date = toDate(input);
  if (!date) return undefined;
  return format(date, 'P', locale ? { locale } : undefined);
}
