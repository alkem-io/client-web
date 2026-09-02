import type { Locale } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';

/**
 * Returns the date-fns Locale that matches the user's currently selected
 * UI language.
 *
 * Lives in the connector layer (not `src/crd/`) because reading
 * `i18n.language` is application-level state. CRD presentational components
 * accept the resolved Locale as a prop and must not call this hook directly.
 *
 * Connectors that render any of the date-aware CRD components (EventsSection,
 * EventCardHeader, EventDateBadge, EventDetailView, EventsCalendarView,
 * DateField, DurationField, EventForm) call `useCrdSpaceLocale()` once and
 * thread the result down via the components' `locale` prop.
 */
export function useCrdSpaceLocale(): Locale {
  const { i18n } = useTranslation('crd-space');
  return resolveDateFnsLocale(i18n.language);
}
