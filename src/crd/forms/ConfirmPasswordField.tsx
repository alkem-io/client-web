import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/crd/lib/utils';

export type ConfirmPasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  errorMessage?: string;
  disabled?: boolean;
  autoComplete?: string;
  /** Accessible label for the show/hide toggle when the value is hidden. */
  showPasswordLabel: string;
  /** Accessible label for the show/hide toggle when the value is visible. */
  hidePasswordLabel: string;
  /**
   * Optional `name` attribute for the underlying input. Left unset by default so
   * the field is NOT serialized into the native form POST — the confirm value is
   * a client-side UX guardrail and must never reach Kratos.
   */
  name?: string;
};

/**
 * Floating-label confirm-password companion for `CrdKratosFlow`'s password
 * input. Controlled (the consumer owns the value so it can compare against the
 * primary password field). Mirrors `FloatingField`'s password styling and
 * show/hide toggle so the two inputs align visually inside the form.
 */
export function ConfirmPasswordField({
  value,
  onChange,
  label,
  errorMessage,
  disabled,
  autoComplete = 'new-password',
  showPasswordLabel,
  hidePasswordLabel,
  name,
}: ConfirmPasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const hasValue = value.length > 0;
  const hasError = !!errorMessage;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          required={true}
          disabled={disabled}
          autoComplete={autoComplete}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder=" "
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          onChange={event => onChange(event.target.value)}
          className={cn(
            'peer h-14 w-full rounded border bg-card px-3.5 pb-2 pt-5 pr-12 text-base md:text-sm text-foreground outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'placeholder:text-transparent disabled:cursor-not-allowed disabled:opacity-50',
            hasError ? 'border-destructive' : 'border-border focus:border-primary'
          )}
        />
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-2.5 bg-card px-1 transition-all',
            'top-1/2 -translate-y-1/2 text-base',
            'peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-caption',
            hasValue && 'top-1.5 translate-y-0 text-caption',
            hasError ? 'text-destructive' : 'text-muted-foreground peer-focus:text-primary'
          )}
        >
          {label} *
        </label>
        <button
          type="button"
          onClick={() => setVisible(current => !current)}
          disabled={disabled}
          aria-label={visible ? hidePasswordLabel : showPasswordLabel}
          aria-pressed={visible}
          className={cn(
            'absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md',
            'text-muted-foreground outline-none hover:text-foreground',
            'focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50'
          )}
        >
          {visible ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
        </button>
      </div>
      {hasError ? (
        <p id={errorId} className="text-caption text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
