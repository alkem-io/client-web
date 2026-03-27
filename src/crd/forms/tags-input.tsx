import { X } from 'lucide-react';
import { type KeyboardEvent, useRef } from 'react';
import { cn } from '@/crd/lib/utils';

type TagsInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
};

export function TagsInput({ value, onChange, placeholder, className, icon }: TagsInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const internalRef = useRef('');

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    internalRef.current = '';
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && internalRef.current.trim()) {
      e.preventDefault();
      addTag(internalRef.current);
    } else if (e.key === 'Backspace' && !internalRef.current && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: click delegates focus to the inner input
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users interact with the inner input directly
    <div
      className={cn('flex flex-wrap items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-md cursor-text', className)}
      style={{
        border: '1px solid var(--border)',
        background: 'var(--background)',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {icon}
      {value.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
          style={{
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
          }}
        >
          {tag}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="hover:opacity-70"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        defaultValue=""
        onChange={e => {
          internalRef.current = e.target.value;
        }}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        aria-label={placeholder}
        className="flex-1 min-w-[120px] border-0 bg-transparent text-sm outline-none"
        style={{ color: 'var(--foreground)' }}
      />
    </div>
  );
}
