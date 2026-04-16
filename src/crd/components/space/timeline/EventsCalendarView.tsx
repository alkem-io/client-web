import type { Locale } from 'date-fns';
import { addDays, format, isBefore, isSameDay, startOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@/crd/hooks/useMediaQuery';
import { endDateFromDuration } from '@/crd/lib/eventDuration';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Calendar } from '@/crd/primitives/calendar';
import { ScrollArea } from '@/crd/primitives/scroll-area';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';
import { EventCard } from './EventCard';

type EventListItem = {
  id: string;
  title: string;
  description?: string;
  startDate: Date | undefined;
  durationMinutes: number;
  durationDays?: number;
  wholeDay: boolean;
  type?: string;
  url: string;
  subspaceName?: string;
};

type EventsCalendarViewProps = {
  events: EventListItem[];
  highlightedDay: Date | null;
  onHighlightDay: (date: Date) => void;
  onEventClick: (event: EventListItem) => void;
  loading?: boolean;
  /** Localized empty-state text. When absent, falls back to a built-in key. */
  emptyMessage?: string;
  /** Right-pane top bar slot (typically the ICS export button). */
  exportSlot?: ReactNode;
  /** date-fns Locale for the calendar grid + tooltip + list rows. Resolved
   *  by the consumer via `useCrdSpaceLocale()`. Defaults to enUS. */
  locale?: Locale;
};

const DESKTOP_BREAKPOINT = '(min-width: 768px)';

type EventBuckets = {
  /** Events keyed by YYYY-MM-DD of their start date. */
  startByDay: Map<string, EventListItem[]>;
  /** Every day the event spans (start + in-between + end), for highlighting. */
  startDates: Date[];
  endDates: Date[];
  betweenDates: Date[];
};

function toDayKey(date: Date): string {
  return format(startOfDay(date), 'yyyy-MM-dd');
}

function buildBuckets(events: EventListItem[]): EventBuckets {
  const startByDay = new Map<string, EventListItem[]>();
  const startDates: Date[] = [];
  const endDates: Date[] = [];
  const betweenDates: Date[] = [];

  for (const event of events) {
    if (!event.startDate) continue;
    const startDay = startOfDay(event.startDate);
    // endDateFromDuration accounts for both durationDays AND durationMinutes;
    // multi-day all-day events (durationDays > 0, durationMinutes = 0) and
    // multi-day timed events both expand correctly into the calendar grid.
    const endInstant = endDateFromDuration(event.startDate, event.durationMinutes, event.durationDays);
    const endDay = startOfDay(endInstant);

    const startKey = toDayKey(startDay);
    const existing = startByDay.get(startKey) ?? [];
    existing.push(event);
    startByDay.set(startKey, existing);

    startDates.push(startDay);
    if (!isSameDay(startDay, endDay)) {
      endDates.push(endDay);
      let cursor = addDays(startDay, 1);
      while (isBefore(cursor, endDay)) {
        betweenDates.push(cursor);
        cursor = addDays(cursor, 1);
      }
    }
  }

  return { startByDay, startDates, endDates, betweenDates };
}

function isPastDate(date: Date): boolean {
  return isBefore(startOfDay(date), startOfDay(new Date()));
}

type DayTooltipProps = {
  events: EventListItem[];
  locale: Locale;
  wholeDayLabel: string;
  children: ReactNode;
};

function DayTooltip({ events, locale, wholeDayLabel, children }: DayTooltipProps) {
  if (events.length === 0) {
    return <>{children}</>;
  }

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild={true}>
        <span className="contents">{children}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <ul className="space-y-0.5">
          {events.map(event => (
            <li key={event.id}>
              {event.wholeDay ? wholeDayLabel : format(event.startDate as Date, 'p', { locale })} — {event.title}
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

function groupEvents(events: EventListItem[]): { future: EventListItem[]; past: EventListItem[] } {
  const today = startOfDay(new Date());
  const future: EventListItem[] = [];
  const past: EventListItem[] = [];

  for (const event of events) {
    if (!event.startDate) {
      future.push(event);
      continue;
    }
    if (isBefore(event.startDate, today)) {
      past.push(event);
    } else {
      future.push(event);
    }
  }

  future.sort((a, b) => (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0));
  past.sort((a, b) => (b.startDate?.getTime() ?? 0) - (a.startDate?.getTime() ?? 0));

  return { future, past };
}

/**
 * Two-column layout on tablet+ (calendar left, list right); on phone the
 * calendar is collapsed behind a "Pick a date" trigger above the list.
 */
export function EventsCalendarView({
  events,
  highlightedDay,
  onHighlightDay,
  onEventClick,
  loading,
  emptyMessage,
  exportSlot,
  locale = enUS,
}: EventsCalendarViewProps) {
  const { t } = useTranslation('crd-space');
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);
  const [mobileCalendarOpen, setMobileCalendarOpen] = useState(false);

  const buckets = buildBuckets(events);
  const { future, past } = groupEvents(events);
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Scroll the highlighted event into view when highlightedDay changes.
  useEffect(() => {
    if (!highlightedDay) return;
    const targetKey = toDayKey(highlightedDay);
    const eventsOnDay = buckets.startByDay.get(targetKey) ?? [];
    const first = eventsOnDay[0];
    if (!first) return;
    const node = cardRefs.current.get(first.id);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedDay, buckets.startByDay]);

  const handleDayClick = (date: Date) => {
    onHighlightDay(date);
    if (!isDesktop) setMobileCalendarOpen(false);
  };

  const wholeDayLabel = t('calendar.tooltip.wholeDayPrefix');

  const calendarEl = (
    <Calendar
      mode="single"
      selected={highlightedDay ?? undefined}
      onDayClick={handleDayClick}
      locale={locale}
      showOutsideDays={true}
      modifiers={{
        eventStart: buckets.startDates,
        eventEnd: buckets.endDates,
        eventBetween: buckets.betweenDates,
        past: isPastDate,
      }}
      modifiersClassNames={{
        eventStart: 'bg-primary/20 rounded-l-md font-semibold',
        eventEnd: 'bg-primary/20 rounded-r-md font-semibold',
        eventBetween: 'bg-primary/20',
        past: 'text-muted-foreground/60',
      }}
      components={{
        DayContent: ({ date }) => {
          const dayKey = toDayKey(date);
          const dayEvents = buckets.startByDay.get(dayKey) ?? [];
          return (
            <DayTooltip events={dayEvents} locale={locale} wholeDayLabel={wholeDayLabel}>
              <span>{format(date, 'd', { locale })}</span>
            </DayTooltip>
          );
        },
      }}
      labels={{
        labelNext: () => t('calendar.calendarA11y.nextMonth'),
        labelPrevious: () => t('calendar.calendarA11y.previousMonth'),
        // Augment the day button's accessible name with the count of events
        // on that day. Sighted-hover users get the full event list via the
        // Tooltip; keyboard / screen-reader users get the count + count of
        // events in the day's accessible name without needing the visual
        // tooltip to fire on focus (which Radix Tooltip doesn't do for a
        // wrapper-span trigger nested inside RDP's own day button).
        labelDay: (day, _modifiers, options) => {
          const base = format(day, 'PPPP', { locale: options?.locale ?? locale });
          const dayKey = toDayKey(day);
          const dayEvents = buckets.startByDay.get(dayKey) ?? [];
          if (dayEvents.length === 0) return base;
          return t('calendar.calendarA11y.dayWithEvents', {
            date: base,
            count: dayEvents.length,
          });
        },
      }}
    />
  );

  const listPane = (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {exportSlot && <div className="flex items-center justify-end">{exportSlot}</div>}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 pr-2">
          {loading && events.length === 0 ? (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          ) : (
            <>
              {future.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground">{emptyMessage ?? t('calendar.noUpcomingEvents')}</p>
              )}
              {future.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  highlighted={highlightedDay ? isSameDay(event.startDate ?? new Date(0), highlightedDay) : false}
                  onClick={() => onEventClick(event)}
                  locale={locale}
                  ref={node => {
                    if (node) cardRefs.current.set(event.id, node);
                    else cardRefs.current.delete(event.id);
                  }}
                />
              ))}
              {past.length > 0 && (
                <h4 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('calendar.pastEvents')}
                </h4>
              )}
              {past.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  highlighted={highlightedDay ? isSameDay(event.startDate ?? new Date(0), highlightedDay) : false}
                  onClick={() => onEventClick(event)}
                  locale={locale}
                  ref={node => {
                    if (node) cardRefs.current.set(event.id, node);
                    else cardRefs.current.delete(event.id);
                  }}
                />
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  if (isDesktop) {
    return (
      <div className="flex min-h-[28rem] flex-row gap-6">
        <div className="shrink-0">{calendarEl}</div>
        {listPane}
      </div>
    );
  }

  // Phone: collapsed calendar trigger above the list.
  return (
    <div className="flex min-h-[28rem] flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setMobileCalendarOpen(v => !v)}
        aria-expanded={mobileCalendarOpen}
      >
        <span>{highlightedDay ? format(highlightedDay, 'PPP', { locale }) : t('calendar.calendarA11y.pickDate')}</span>
        {mobileCalendarOpen ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
      <div className={cn('overflow-hidden transition-all', mobileCalendarOpen ? 'max-h-[420px]' : 'max-h-0')}>
        {calendarEl}
      </div>
      {listPane}
    </div>
  );
}
