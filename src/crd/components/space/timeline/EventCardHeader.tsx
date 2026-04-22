import type { Locale } from 'date-fns';
import { format, isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { endDateFromDuration } from '@/crd/lib/eventDuration';
import { Badge } from '@/crd/primitives/badge';
import { Skeleton } from '@/crd/primitives/skeleton';
import { EventDateBadge } from './EventDateBadge';

type EventCardHeaderEvent = {
  title: string;
  startDate: Date | undefined;
  durationMinutes: number;
  durationDays?: number;
  wholeDay: boolean;
  type?: string;
  subspaceName?: string;
};

type EventCardHeaderProps = {
  event: EventCardHeaderEvent;
  loading?: boolean;
  /** "sm" for list rows, "md" for detail header. Defaults to "sm". */
  size?: 'sm' | 'md';
  /** date-fns Locale for the meta row's time formatting + the EventDateBadge.
   *  Resolved by the consumer via `useCrdSpaceLocale()`. Defaults to enUS. */
  locale?: Locale;
};

/** Badge + title + meta row (date, time / duration, type, subspace chip). */
export function EventCardHeader({ event, loading, size = 'sm', locale = enUS }: EventCardHeaderProps) {
  const { t } = useTranslation('crd-space');

  if (loading) {
    return (
      <div className="flex items-start gap-3">
        <Skeleton className="h-14 w-12 rounded-md" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  const meta: string[] = [];
  if (event.startDate) {
    if (event.wholeDay) {
      meta.push(t('calendar.tooltip.wholeDayPrefix'));
    } else {
      const endDate = endDateFromDuration(event.startDate, event.durationMinutes, event.durationDays);
      const sameDay = isSameDay(event.startDate, endDate);
      if (sameDay) {
        meta.push(`${format(event.startDate, 'p', { locale })} – ${format(endDate, 'p', { locale })}`);
      } else {
        meta.push(`${format(event.startDate, 'p', { locale })} →`);
      }
    }
  }

  // Event type label via calendar.type.<ENUM_VALUE>. If the backend ever
  // ships a new enum value we don't know about, fall back to the localized
  // 'unknown' label rather than leaking a raw enum string into the UI.
  if (event.type) {
    const typeKey = `calendar.type.${event.type}`;
    const fallback = t('calendar.type.unknown');
    meta.push(t(typeKey, { defaultValue: fallback }));
  }

  const titleClass = size === 'md' ? 'text-subsection-title leading-tight' : 'text-card-title leading-snug';

  return (
    <div className="flex items-start gap-3">
      <EventDateBadge
        startDate={event.startDate}
        durationMinutes={event.durationMinutes}
        durationDays={event.durationDays}
        wholeDay={event.wholeDay}
        size={size}
        locale={locale}
      />
      <div className="min-w-0 flex-1">
        <h3 className={titleClass}>{event.title}</h3>
        {(meta.length > 0 || event.subspaceName) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-caption text-muted-foreground">
            {meta.join(' • ')}
            {event.subspaceName && (
              <Badge variant="secondary" className="font-normal">
                {t('calendar.details.subspaceLabel', { name: event.subspaceName })}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
