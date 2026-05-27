import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/crd/lib/utils';

export type FloatingFieldProps = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'password';
  /** Initial value. The field is uncontrolled — the native form submits the live DOM value. */
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  errorMessage?: string;
  /** Accessible label for the show/hide toggle when hidden (password type only). */
  showPasswordLabel?: string;
  /** Accessible label for the show/hide toggle when visible (password type only). */
  hidePasswordLabel?: string;
  /** Fires on every input change. The field stays uncontrolled; the callback is
   * for consumers that need to react to live values (e.g. disabling submit until
   * required fields are filled). */
  onValueChange?: (value: string) => void;
};

/**
 * Floating-label text input — the label sits as a placeholder inside the field
 * when empty and floats up onto the border when the field is focused or filled.
 * Uncontrolled (native `defaultValue`); the floating behaviour is pure CSS via
 * the `:placeholder-shown` peer trick, so it works without React state.
 */
export function FloatingField({
  name,
  label,
  type = 'text',
  defaultValue,
  required,
  disabled,
  autoComplete,
  errorMessage,
  showPasswordLabel,
  hidePasswordLabel,
  onValueChange,
}: FloatingFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = Boolean(errorMessage);
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && visible ? 'text' : type;

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <input
          id={id}
          name={name}
          type={inputType}
          defaultValue={defaultValue}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder=" "
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          onChange={onValueChange ? event => onValueChange(event.target.value) : undefined}
          className={cn(
            'peer h-14 w-full rounded border bg-card px-3.5 pb-2 pt-5 text-base text-foreground outline-none transition-colors',
            'placeholder:text-transparent disabled:cursor-not-allowed disabled:opacity-50',
            // Keep the field background white when the browser autofills it, so the
            // floating label's notch (also white) stays seamless instead of showing
            // as a pasted-on patch over Chrome's pale-blue autofill fill.
            '[&:-webkit-autofill]:[-webkit-box-shadow:inset_0_0_0_1000px_var(--card)]',
            '[&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]',
            '[&:-webkit-autofill]:[caret-color:var(--foreground)]',
            isPassword && 'pr-12',
            hasError ? 'border-destructive' : 'border-border focus:border-primary'
          )}
        />
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-2.5 top-1.5 bg-card px-1 text-[12px] transition-all',
            'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base',
            'peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[12px]',
            hasError ? 'text-destructive' : 'text-muted-foreground peer-focus:text-primary'
          )}
        >
          {label}
          {required ? ' *' : ''}
        </label>
        {isPassword ? (
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
        ) : null}
      </div>
      {hasError ? (
        <p id={errorId} className="text-caption text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
