import { format, parse, setHours, setMinutes } from 'date-fns';
import { useId } from 'react';
import { cn } from '@/crd/lib/utils';

type TimeFieldProps = {
  label?: string;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  /** Lower bound on the time portion. Only the HH:mm is used. */
  minTime?: Date;
  disabled?: boolean;
  error?: string;
  className?: string;
  ariaLabel?: string;
};

/** Native <input type="time"> styled like the Input primitive. Preserves the
 *  date portion of `value` when the time is edited. */
export function TimeField({ label, value, onChange, minTime, disabled, error, className, ariaLabel }: TimeFieldProps) {
  const id = useId();
  const hasError = Boolean(error);
  const inputValue = value ? format(value, 'HH:mm') : '';
  const minValue = minTime ? format(minTime, 'HH:mm') : undefined;

  const handleChange = (raw: string) => {
    if (!raw) {
      onChange(undefined);
      return;
    }
    // Parse "HH:mm" and preserve the date portion of the current `value`
    // (or today's date if value is undefined).
    const reference = value ?? new Date();
    const parsed = parse(raw, 'HH:mm', reference);
    if (Number.isNaN(parsed.getTime())) return;

    // Apply the parsed H/M onto the reference to avoid timezone surprises.
    const next = setMinutes(setHours(reference, parsed.getHours()), parsed.getMinutes());
    onChange(next);
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={id}
        type="time"
        value={inputValue}
        min={minValue}
        disabled={disabled}
        onChange={event => handleChange(event.target.value)}
        aria-label={label ?? ariaLabel}
        aria-invalid={hasError || undefined}
        className={cn(
          'h-9 w-full rounded-md border px-3 py-1 text-sm bg-input-background transition-[color,box-shadow] outline-none',
          'border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-destructive'
        )}
      />
      {hasError && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
