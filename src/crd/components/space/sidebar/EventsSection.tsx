import type { Locale } from 'date-fns';
import { differenceInCalendarDays, format, startOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ChevronDown, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';

type SidebarEventItem = {
  id: string;
  title: string;
  startDate: Date | undefined;
  url?: string;
};

type EventsSectionProps = {
  events: SidebarEventItem[];
  onShowCalendar?: () => void;
  onAddEvent?: () => void;
  /** Optional — when set, each row becomes interactive. */
  onEventClick?: (event: SidebarEventItem) => void;
  className?: string;
  /** date-fns Locale for the relative-date formatter. Resolved by the
   *  connector via `useCrdSpaceLocale()`. Defaults to enUS. */
  locale?: Locale;
};

export function EventsSection({
  events,
  onShowCalendar,
  onAddEvent,
  onEventClick,
  className,
  locale = enUS,
}: EventsSectionProps) {
  const { t } = useTranslation('crd-space');
  const now = new Date();

  const formatRelativeDate = (date: Date): string => {
    const diffDays = differenceInCalendarDays(startOfDay(date), startOfDay(now));

    if (diffDays === 0) return t('sidebar.eventDateRelative.today');
    if (diffDays === 1) return t('sidebar.eventDateRelative.tomorrow');
    if (diffDays > 1 && diffDays <= 7) return t('sidebar.eventDateRelative.in_days', { count: diffDays });

    return format(date, 'MMM d', { locale });
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <h3 className="uppercase text-label text-muted-foreground">{t('sidebar.events')}</h3>
          <ChevronDown className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
        </div>
        {onAddEvent && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full text-primary"
            style={{
              background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
            }}
            onClick={onAddEvent}
            aria-label={t('sidebar.addEvent')}
          >
            <Plus className="w-3 h-3" aria-hidden="true" />
          </Button>
        )}
      </div>
      {events.length === 0 ? (
        <p className="px-3 text-sm text-muted-foreground">{t('sidebar.noEvents')}</p>
      ) : (
        <ul className="space-y-2 px-3">
          {events.map(event => {
            const dateLabel = event.startDate ? formatRelativeDate(event.startDate) : '';
            const content = (
              <>
                <span className="text-foreground font-medium">{event.title}</span>
                {dateLabel && <span className="text-muted-foreground ml-2">{dateLabel}</span>}
              </>
            );

            return (
              <li key={event.id} className="text-sm">
                {onEventClick ? (
                  <button
                    type="button"
                    className="w-full text-left cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    onClick={() => onEventClick(event)}
                  >
                    {content}
                  </button>
                ) : (
                  <div>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {onShowCalendar && (
        <button
          type="button"
          className="px-3 mt-2 text-sm font-medium text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={onShowCalendar}
        >
          {t('sidebar.showCalendar')}
        </button>
      )}
    </div>
  );
}
