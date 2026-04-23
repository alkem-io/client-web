import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/crd/lib/utils';
import { Input } from '@/crd/primitives/input';
import { Textarea } from '@/crd/primitives/textarea';

/**
 * InlineEditText — inline editor with auto-save on blur or idle timeout.
 *
 * **Idle state**: renders value as plain text. On hover, a dashed underline
 * and a faded pencil icon appear (FR-006a). Clicking enters edit mode.
 *
 * **Edit state**: renders an Input (single-line) or Textarea (multi-line).
 * Commits automatically when:
 *   - The user clicks outside (blur)
 *   - The user stops typing for 2 seconds
 *   - Escape reverts to the original value and exits edit mode
 *
 * No ✓ / ✗ buttons — commit is implicit.
 */

const IDLE_DEBOUNCE_MS = 2000;

type InlineEditTextProps = {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
  editAriaLabel: string;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
  /** Validation error — renders below the field in destructive color. */
  error?: string;
  className?: string;
  /** Unused — kept for BC with existing call sites. */
  confirmAriaLabel?: string;
  cancelAriaLabel?: string;
};

export function InlineEditText({
  value,
  onChange,
  ariaLabel,
  editAriaLabel,
  placeholder,
  multiline = false,
  disabled = false,
  error,
  className,
}: InlineEditTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [isEditing, value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Clean up timer on unmount.
  useEffect(
    () => () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    },
    []
  );

  const commit = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = undefined;
    }
    const trimmed = draft.trim();
    if (trimmed !== value.trim()) {
      onChange(trimmed);
    }
    setIsEditing(false);
  };

  const revert = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = undefined;
    }
    setDraft(value);
    setIsEditing(false);
  };

  const scheduleIdleCommit = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      commit();
    }, IDLE_DEBOUNCE_MS);
  };

  const handleChange = (next: string) => {
    setDraft(next);
    scheduleIdleCommit();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      revert();
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      if (!multiline || !event.shiftKey) {
        event.preventDefault();
        commit();
      }
    }
  };

  if (!isEditing) {
    return (
      <div>
        <button
          type="button"
          aria-label={editAriaLabel}
          onClick={() => setIsEditing(true)}
          disabled={disabled}
          className={cn(
            'group inline-flex items-center gap-1.5 bg-transparent p-0 text-left',
            'cursor-text disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm',
            error && 'text-destructive',
            className
          )}
        >
          <span
            className={cn(
              'decoration-muted-foreground/50 decoration-dashed underline-offset-4',
              'group-hover:underline',
              !value && 'text-muted-foreground'
            )}
          >
            {value || placeholder || ''}
          </span>
          <Pencil aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground/40" />
        </button>
        {error && <p className="mt-0.5 text-caption text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn('flex items-start', className)}>
      {multiline ? (
        <Textarea
          ref={inputRef as React.Ref<HTMLTextAreaElement>}
          aria-label={ariaLabel}
          value={draft}
          onChange={event => handleChange(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
      ) : (
        <Input
          ref={inputRef as React.Ref<HTMLInputElement>}
          aria-label={ariaLabel}
          value={draft}
          onChange={event => handleChange(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
      )}
    </div>
  );
}
