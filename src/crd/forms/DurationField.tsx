import type { Locale } from 'date-fns';
import { addMinutes, format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';

type DurationFieldProps = {
  label?: string;
  /** Anchor used to render the "ends at HH:mm" caption. */
  startDate: Date | undefined;
  /** Duration in minutes. */
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  /** Override the preset list of duration options (in minutes). */
  options?: number[];
  disabled?: boolean;
  error?: string;
  className?: string;
  ariaLabel?: string;
  /** date-fns Locale used to format the "ends at HH:mm" caption. Resolved
   *  by the connector via `useCrdSpaceLocale()`. Defaults to enUS. */
  locale?: Locale;
};

const DEFAULT_OPTIONS_MINUTES = [15, 30, 45, 60, 90, 120, 180, 240, 480];

/** Select dropdown of preset durations + a derived "ends at HH:mm" caption.
 *  Replaced the earlier free-form numeric input because:
 *    - HTML `<input type="number" min={1} step={15}>` validates against
 *      `1 + 15n` so common values like 30 were rejected by the browser.
 *    - A bounded preset list matches the calendar-app convention and removes
 *      the chance of the user typing implausible values (e.g. 7 minutes). */
export function DurationField({
  label,
  startDate,
  value,
  onChange,
  options = DEFAULT_OPTIONS_MINUTES,
  disabled,
  error,
  className,
  ariaLabel,
  locale = enUS,
}: DurationFieldProps) {
  const { t } = useTranslation('crd-space');
  const id = useId();
  const hasError = Boolean(error);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return t('calendar.fields.durationOption.minutes', { count: minutes });
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return t('calendar.fields.durationOption.hours', { count: hours });
    }
    return t('calendar.fields.durationOption.hoursMinutes', { hours, minutes: remainingMinutes });
  };

  // Ensure the current value appears in the dropdown even if it isn't in the
  // preset list (edit mode may load arbitrary historical durations).
  const optionsIncludingValue =
    typeof value === 'number' && value > 0 && !options.includes(value)
      ? [...options, value].sort((a, b) => a - b)
      : options;

  const endsAtCaption =
    startDate && typeof value === 'number' && value > 0
      ? t('calendar.fields.endsAt', { time: format(addMinutes(startDate, value), 'p', { locale }) })
      : null;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
      <Select
        value={typeof value === 'number' ? String(value) : undefined}
        onValueChange={next => onChange(next ? Number(next) : undefined)}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          aria-label={label ?? ariaLabel}
          aria-invalid={hasError || undefined}
          className={cn(hasError && 'border-destructive')}
        >
          <SelectValue placeholder={label ?? ''} />
        </SelectTrigger>
        <SelectContent>
          {optionsIncludingValue.map(minutes => (
            <SelectItem key={minutes} value={String(minutes)}>
              {formatDuration(minutes)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {endsAtCaption && !hasError && <span className="text-xs text-muted-foreground">{endsAtCaption}</span>}
      {hasError && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
