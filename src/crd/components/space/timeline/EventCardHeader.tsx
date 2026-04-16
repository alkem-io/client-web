import { addMinutes, format, isSameDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
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
};

/** Badge + title + meta row (date, time / duration, type, subspace chip). */
export function EventCardHeader({ event, loading, size = 'sm' }: EventCardHeaderProps) {
  const { t, i18n } = useTranslation('crd-space');
  const locale = resolveDateFnsLocale(i18n.language);

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
      const endDate = addMinutes(event.startDate, event.durationMinutes);
      const sameDay = isSameDay(event.startDate, endDate);
      if (sameDay) {
        meta.push(`${format(event.startDate, 'p', { locale })} – ${format(endDate, 'p', { locale })}`);
      } else {
        meta.push(`${format(event.startDate, 'p', { locale })} →`);
      }
    }
  }

  // Event type label via calendar.type.<ENUM_VALUE>; fall back to the raw value
  // if the enum value is unknown. Typed i18next rejects fully-dynamic keys,
  // so we compose via a template string and defer to runtime resolution.
  if (event.type) {
    const typeKey = `calendar.type.${event.type}`;
    const translated = t(typeKey, { defaultValue: event.type });
    meta.push(translated);
  }

  const titleClass = size === 'md' ? 'text-lg font-semibold leading-tight' : 'text-sm font-semibold leading-snug';

  return (
    <div className="flex items-start gap-3">
      <EventDateBadge
        startDate={event.startDate}
        durationMinutes={event.durationMinutes}
        durationDays={event.durationDays}
        wholeDay={event.wholeDay}
        size={size}
      />
      <div className="min-w-0 flex-1">
        <h3 className={titleClass}>{event.title}</h3>
        {(meta.length > 0 || event.subspaceName) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
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
