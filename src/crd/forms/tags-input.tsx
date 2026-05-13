import { X } from 'lucide-react';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { cn } from '@/crd/lib/utils';

type TagsInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  /**
   * Localized aria-label formatters. Consumers should pass these from their
   * `useTranslation` to keep user-visible (screen-reader) text out of this
   * component. When omitted the aria-label falls back to the tag value itself
   * — informative for screen readers and language-neutral.
   */
  formatEditTagAriaLabel?: (tag: string) => string;
  formatEditButtonAriaLabel?: (tag: string) => string;
  formatRemoveButtonAriaLabel?: (tag: string) => string;
};

export function TagsInput({
  value,
  onChange,
  placeholder,
  className,
  icon,
  formatEditTagAriaLabel,
  formatEditButtonAriaLabel,
  formatRemoveButtonAriaLabel,
}: TagsInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingIndex]);

  const normalize = (raw: string) => raw.trim().toLowerCase();

  const addTags = (raw: string) => {
    // Mirrors MUI's `Comma-separated tags` input — `"foo, bar"` or a single
    // `"foo"` both work, and pasting a list adds each entry as its own chip
    // in one pass. Dedupe against existing values so re-entering a tag is a no-op.
    const parts = raw
      .split(',')
      .map(part => normalize(part))
      .filter(Boolean);
    if (parts.length === 0) {
      setInputValue('');
      return;
    }
    const next = [...value];
    for (const tag of parts) {
      if (!next.includes(tag)) next.push(tag);
    }
    if (next.length !== value.length) onChange(next);
    setInputValue('');
  };

  const addTag = (raw: string) => addTags(raw);

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(value[index]);
  };

  const commitEdit = () => {
    if (editingIndex === null) return;
    const next = normalize(editingValue);
    const original = value[editingIndex];
    if (!next) {
      onChange(value.filter((_, i) => i !== editingIndex));
    } else if (next !== original && value.includes(next)) {
      onChange(value.filter((_, i) => i !== editingIndex));
    } else {
      onChange(value.map((t, i) => (i === editingIndex ? next : t)));
    }
    setEditingIndex(null);
    setEditingValue('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (text.includes(',')) {
      e.preventDefault();
      addTags(text);
    }
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: click delegates focus to the inner input
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users interact with the inner input directly
    <div
      className={cn(
        'flex flex-wrap items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-md cursor-text border border-border bg-background',
        className
      )}
      onClick={() => {
        if (editingIndex === null) inputRef.current?.focus();
      }}
    >
      {icon}
      {value.map((tag, index) => {
        if (editingIndex === index) {
          return (
            <input
              key={tag}
              ref={editInputRef}
              type="text"
              value={editingValue}
              onChange={e => setEditingValue(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={commitEdit}
              aria-label={formatEditTagAriaLabel ? formatEditTagAriaLabel(tag) : tag}
              className="px-2 py-0.5 rounded-md text-caption font-medium border border-primary text-primary bg-background outline-none focus:ring-2 focus:ring-ring min-w-[60px]"
              style={{
                width: `${Math.max(editingValue.length, 4) + 2}ch`,
              }}
            />
          );
        }
        return (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-caption font-medium border border-primary text-primary bg-primary/10"
          >
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                startEditing(index);
              }}
              className="bg-transparent border-none p-0 text-inherit font-inherit cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
              aria-label={formatEditButtonAriaLabel ? formatEditButtonAriaLabel(tag) : tag}
            >
              {tag}
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="hover:opacity-70 cursor-pointer rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={formatRemoveButtonAriaLabel ? formatRemoveButtonAriaLabel(tag) : tag}
            >
              <X className="size-3" />
            </button>
          </span>
        );
      })}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => {
          if (inputValue.trim()) addTag(inputValue);
        }}
        placeholder={value.length === 0 ? placeholder : ''}
        aria-label={placeholder}
        className="flex-1 min-w-[120px] border-0 bg-transparent text-control outline-none text-foreground"
      />
    </div>
  );
}
