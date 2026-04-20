import type { Locale } from 'date-fns';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Calendar } from '@/crd/primitives/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';

type DateFieldBaseProps = {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /**
   * date-fns Locale used for formatting the trigger label and the calendar
   * popover. The consumer (a connector) resolves it from the user's selected
   * UI language via `useCrdSpaceLocale()`. CRD components must not read
   * `i18n.language` themselves. Defaults to enUS to keep the standalone
   * preview app and component tests working without explicit threading.
   */
  locale?: Locale;
};

/**
 * Discriminated union: every DateField MUST receive either a visible `label`
 * or an explicit `ariaLabel`, so the trigger always has a persistent
 * accessible name (WCAG 2.1 AA — see CRD CLAUDE.md "Form inputs").
 */
type DateFieldProps =
  | (DateFieldBaseProps & { label: string; ariaLabel?: string })
  | (DateFieldBaseProps & { label?: undefined; ariaLabel: string });

/** Popover-based date picker. Controlled via `value`/`onChange`. */
export function DateField({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  disabled,
  placeholder,
  error,
  required,
  className,
  ariaLabel,
  locale = enUS,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const labelText = ariaLabel ?? label;
  const hasError = Boolean(error);
  const errorId = hasError ? `${id}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-body-emphasis">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild={true}>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label={labelText}
            aria-invalid={hasError || undefined}
            aria-describedby={errorId}
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
              hasError && 'border-destructive'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            {value ? format(value, 'PPP', { locale }) : (placeholder ?? '')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={next => {
              onChange(next);
              setOpen(false);
            }}
            disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]}
            locale={locale}
            initialFocus={true}
          />
        </PopoverContent>
      </Popover>
      {hasError && (
        <span id={errorId} className="text-caption text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
