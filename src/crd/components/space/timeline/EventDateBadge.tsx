import { addMinutes, format, isBefore, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { cn } from '@/crd/lib/utils';

type EventDateBadgeProps = {
  startDate: Date | undefined;
  durationMinutes: number;
  durationDays?: number;
  wholeDay?: boolean;
  /** "sm" for sidebar/list rows, "md" for detail header. Defaults to "sm". */
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Stacked month / day badge. Past events render in muted colour. When the
 * event spans multiple days, a secondary "→ MMM d" line appears.
 */
export function EventDateBadge({
  startDate,
  durationMinutes,
  durationDays,
  wholeDay,
  size = 'sm',
  className,
}: EventDateBadgeProps) {
  const { i18n } = useTranslation('crd-space');
  const locale = resolveDateFnsLocale(i18n.language);

  if (!startDate) {
    return null;
  }

  const isPast = isBefore(startOfDay(startDate), startOfDay(new Date()));
  const isMultiDay = Boolean(durationDays && durationDays > 0);
  const endDate = addMinutes(startDate, durationMinutes);

  const monthLabel = format(startDate, 'MMM', { locale });
  const dayLabel = format(startDate, 'd', { locale });

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
      aria-hidden={true}
    >
      <span>{monthLabel}</span>
      <span className={cn('font-bold', dayTextSize)}>{dayLabel}</span>
      {!wholeDay && isMultiDay && (
        <span className="mt-0.5 text-[10px] font-normal normal-case">→ {format(endDate, 'MMM d', { locale })}</span>
      )}
    </div>
  );
}
