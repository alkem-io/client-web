import { Check, Pencil, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Textarea } from '@/crd/primitives/textarea';

/**
 * InlineEditText — a single-line or multi-line inline editor.
 *
 * Visual-only state (idle / editing). Never talks to the backend — consumers
 * commit the new value via `onChange`. Used by the CRD Space Settings Layout
 * tab for column titles and column descriptions.
 *
 * **Hover-reveal affordance (spec 045 FR-006a)**:
 * In idle state the value renders as plain text. On hover, the text gains a
 * 1px underline in `text-muted-foreground` and a small `Pencil` icon at
 * `size-3` appears inline after the text with `ml-1`. The pencil button is
 * keyboard-focusable (Tab + Enter / Space). Clicking either the text or the
 * pencil enters edit mode.
 *
 * In editing state: an Input (single-line) or Textarea (multi-line) pre-filled
 * with the value; Enter commits single-line; Ctrl/Cmd+Enter commits multi-line;
 * Escape cancels. Confirm / Cancel buttons are always visible in editing state.
 */

type InlineEditTextProps = {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
  editAriaLabel: string;
  confirmAriaLabel: string;
  cancelAriaLabel: string;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
  className?: string;
};

export function InlineEditText({
  value,
  onChange,
  ariaLabel,
  editAriaLabel,
  confirmAriaLabel,
  cancelAriaLabel,
  placeholder,
  multiline = false,
  disabled = false,
  className,
}: InlineEditTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

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

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed !== value.trim()) {
      onChange(trimmed);
    }
    setIsEditing(false);
  }, [draft, onChange, value]);

  const cancel = useCallback(() => {
    setDraft(value);
    setIsEditing(false);
  }, [value]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        cancel();
        return;
      }
      if (event.key === 'Enter') {
        if (multiline) {
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            commit();
          }
          return;
        }
        event.preventDefault();
        commit();
      }
    },
    [cancel, commit, multiline]
  );

  if (!isEditing) {
    // Hover-reveal: underline + trailing pencil appear on group-hover.
    // Clicking either the text or the pencil enters edit mode. Per FR-006a.
    return (
      <button
        type="button"
        aria-label={editAriaLabel}
        onClick={() => setIsEditing(true)}
        disabled={disabled}
        className={cn(
          'group inline-flex items-baseline gap-1 bg-transparent p-0 text-left',
          'cursor-text disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm',
          className
        )}
      >
        <span
          className={cn(
            'group-hover:underline group-hover:decoration-muted-foreground group-hover:decoration-solid',
            !value && 'text-muted-foreground'
          )}
        >
          {value || placeholder || ''}
        </span>
        <Pencil
          aria-hidden="true"
          className="ml-1 size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      </button>
    );
  }

  return (
    <div className={cn('flex items-start gap-2', className)}>
      {multiline ? (
        <Textarea
          ref={inputRef as React.Ref<HTMLTextAreaElement>}
          aria-label={ariaLabel}
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
      ) : (
        <Input
          ref={inputRef as React.Ref<HTMLInputElement>}
          aria-label={ariaLabel}
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={confirmAriaLabel}
        onClick={commit}
        disabled={disabled}
      >
        <Check aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={cancelAriaLabel}
        onClick={cancel}
        disabled={disabled}
      >
        <X aria-hidden="true" />
      </Button>
    </div>
  );
}
