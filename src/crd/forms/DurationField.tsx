import type { Locale } from 'date-fns';
import { addMinutes, format } from 'date-fns';
import { bg, de, enUS, es, fr, nl } from 'date-fns/locale';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Input } from '@/crd/primitives/input';

type DurationFieldProps = {
  label?: string;
  /** Anchor used to render the "ends at HH:mm" caption. */
  startDate: Date | undefined;
  /** Duration in minutes. */
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  step?: number;
  disabled?: boolean;
  error?: string;
  className?: string;
  ariaLabel?: string;
};

const LOCALE_BY_LANG: Record<string, Locale> = { en: enUS, nl, es, bg, de, fr };

function resolveLocale(langCode: string | undefined): Locale {
  if (!langCode) return enUS;
  const base = langCode.split('-')[0];
  return LOCALE_BY_LANG[base] ?? enUS;
}

/** Numeric minutes input with a derived "ends at HH:mm" caption. */
export function DurationField({
  label,
  startDate,
  value,
  onChange,
  step = 15,
  disabled,
  error,
  className,
  ariaLabel,
}: DurationFieldProps) {
  const { t, i18n } = useTranslation('crd-space');
  const locale = resolveLocale(i18n.language);
  const id = useId();
  const hasError = Boolean(error);

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
      <Input
        id={id}
        type="number"
        min={1}
        step={step}
        disabled={disabled}
        value={typeof value === 'number' ? value : ''}
        onChange={event => {
          const raw = event.target.value;
          onChange(raw === '' ? undefined : Number(raw));
        }}
        aria-label={label ?? ariaLabel}
        aria-invalid={hasError || undefined}
        className={cn(hasError && 'border-destructive')}
      />
      {endsAtCaption && !hasError && <span className="text-xs text-muted-foreground">{endsAtCaption}</span>}
      {hasError && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
