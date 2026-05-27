import type { ReactNode } from 'react';
import { useId } from 'react';
import { cn } from '@/crd/lib/utils';
import { Checkbox } from '@/crd/primitives/checkbox';

export type AcceptTermsCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /**
   * Rich-content label. The consumer supplies the rendered text with the
   * Terms-of-Use and Privacy-Policy anchor tags already wired up.
   */
  label: ReactNode;
  /** Form field name — when set, the checkbox submits in the native form. */
  name?: string;
  /** Value submitted when checked (defaults to "true"). */
  value?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
};

export function AcceptTermsCheckbox({
  checked,
  onChange,
  label,
  name,
  value = 'true',
  errorMessage,
  required,
  disabled,
}: AcceptTermsCheckboxProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = Boolean(errorMessage);

  // When required and not yet checked, give the checkbox a destructive ring so
  // the user can see at a glance that ticking it is mandatory (matches the way
  // empty required text fields read as "needs attention").
  const showRequiredIndicator = required && !checked;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-2">
        <Checkbox
          id={id}
          name={name}
          value={value}
          checked={checked}
          onCheckedChange={state => onChange(state === true)}
          required={required}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className={cn('mt-0.5', showRequiredIndicator && 'border-destructive')}
        />
        <label htmlFor={id} className="text-body cursor-pointer select-none">
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </label>
      </div>
      {hasError ? (
        <p id={errorId} className="text-caption text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
