import { Smile } from 'lucide-react';
import type { RefObject } from 'react';
import { EmojiPicker } from '@/crd/components/common/EmojiPicker';
import { cn } from '@/crd/lib/utils';

type EmojiInsertButtonProps = {
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
};

export function EmojiInsertButton({
  inputRef,
  value,
  onChange,
  ariaLabel,
  disabled,
  className,
}: EmojiInsertButtonProps) {
  const handleSelect = (emoji: string) => {
    const el = inputRef.current;
    if (!el) {
      onChange(value + emoji);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + emoji + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      const node = inputRef.current;
      if (!node) return;
      const pos = start + emoji.length;
      node.focus();
      node.setSelectionRange(pos, pos);
    });
  };

  return (
    <EmojiPicker
      onSelect={handleSelect}
      trigger={
        <button
          type="button"
          className={cn(
            'shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60',
            className
          )}
          aria-label={ariaLabel}
          disabled={disabled}
        >
          <Smile className="w-4 h-4" aria-hidden="true" />
        </button>
      }
    />
  );
}
