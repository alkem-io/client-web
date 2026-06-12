import { useId, useState } from 'react';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';

type UrlResolveFieldProps = {
  label: string;
  buttonLabel: string;
  placeholder?: string;
  onResolve: (url: string) => void;
  loading?: boolean;
  disabled?: boolean;
};

/**
 * A URL input + "resolve" button. The operator pastes an entity URL; on submit
 * the trimmed value is handed to `onResolve` (which the integration layer
 * resolves to an entity id). Pure presentation.
 */
export function UrlResolveField({
  label,
  buttonLabel,
  placeholder,
  onResolve,
  loading = false,
  disabled = false,
}: UrlResolveFieldProps) {
  const [url, setUrl] = useState('');
  const inputId = useId();

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
      onSubmit={event => {
        event.preventDefault();
        if (url.trim()) onResolve(url.trim());
      }}
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor={inputId} className="text-body-emphasis">
          {label}
        </label>
        <Input
          id={inputId}
          value={url}
          onChange={event => setUrl(event.target.value)}
          placeholder={placeholder ?? label}
          disabled={disabled}
        />
      </div>
      <Button type="submit" variant="outline" disabled={disabled || loading || !url.trim()} aria-busy={loading}>
        {buttonLabel}
      </Button>
    </form>
  );
}
