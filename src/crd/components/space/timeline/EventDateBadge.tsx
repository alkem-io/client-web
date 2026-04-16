import type { Locale } from 'date-fns';
import { format, isBefore, startOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { endDateFromDuration } from '@/crd/lib/eventDuration';
import { cn } from '@/crd/lib/utils';

type EventDateBadgeProps = {
  startDate: Date | undefined;
  durationMinutes: number;
  durationDays?: number;
  wholeDay?: boolean;
  /** "sm" for sidebar/list rows, "md" for detail header. Defaults to "sm". */
  size?: 'sm' | 'md';
  className?: string;
  /** date-fns Locale for the month/day labels. Resolved by the consumer via
   *  `useCrdSpaceLocale()`. Defaults to enUS. */
  locale?: Locale;
};

/**
 * Stacked month / day badge. Past events render in muted colour. When the
 * event spans multiple days, a secondary "→ MMM d" line appears.
 *
 * Accessibility: the inner text glyphs (MMM / d / → MMM d) are decorative
 * (`aria-hidden`) because the parent badge exposes the entire date as an
 * `aria-label`. This avoids screen readers reading "Apr" "14" "→" "Apr 16"
 * as four separate fragments while still keeping the date in the a11y tree.
 */
export function EventDateBadge({
  startDate,
  durationMinutes,
  durationDays,
  wholeDay,
  size = 'sm',
  className,
  locale = enUS,
}: EventDateBadgeProps) {
  if (!startDate) {
    return null;
  }

  const isPast = isBefore(startOfDay(startDate), startOfDay(new Date()));
  const endDate = endDateFromDuration(startDate, durationMinutes, durationDays);
  const isMultiDay = !wholeDay && (durationDays ?? 0) > 0;
  // For whole-day events with durationDays > 0, the visual span is also "multi-day"
  // even though we don't show the secondary time-range label.
  const showRangeLabel = isMultiDay;

  const monthLabel = format(startDate, 'MMM', { locale });
  const dayLabel = format(startDate, 'd', { locale });
  const startLong = format(startDate, 'PPP', { locale });
  const endLong = format(endDate, 'PPP', { locale });
  const ariaLabel = isMultiDay || (durationDays ?? 0) > 0 ? `${startLong} – ${endLong}` : startLong;

  const sizeClasses = size === 'md' ? 'min-w-14 px-2 py-1.5 text-xs' : 'min-w-12 px-1.5 py-1 text-[11px]';
  const dayTextSize = size === 'md' ? 'text-xl leading-tight' : 'text-base leading-tight';

  return (
    <div
      className={cn(
        'inline-flex shrink-0 flex-col items-center rounded-md border text-center font-medium uppercase tracking-wide',
        sizeClasses,
        isPast
          ? 'border-muted-foreground/30 bg-muted/40 text-muted-foreground'
          : 'border-primary/30 bg-primary/10 text-primary',
        className
      )}
      role="img"
      aria-label={ariaLabel}
    >
      <span aria-hidden={true}>{monthLabel}</span>
      <span className={cn('font-bold', dayTextSize)} aria-hidden={true}>
        {dayLabel}
      </span>
      {showRangeLabel && (
        <span className="mt-0.5 text-badge font-normal normal-case" aria-hidden={true}>
          → {format(endDate, 'MMM d', { locale })}
        </span>
      )}
    </div>
  );
}
