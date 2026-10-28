import { useId, useState } from 'react';
import { cn } from '@/crd/lib/utils';
import { Input } from '@/crd/primitives/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/crd/primitives/popover';

export type CityOption = {
  /** Stable key, unique across all options (e.g. "ES.madrid"). */
  id: string;
  /** Localized city name — what gets written into the field on select. */
  name: string;
  /** ISO code of the city's country. */
  countryCode: string;
  /** Country name shown next to the city for disambiguation. */
  countryName: string;
};

type CityAutocompleteInputProps = {
  value: string;
  /** Free-text edits — any value is accepted. */
  onChange: (value: string) => void;
  /** A suggestion was picked. */
  onSelect: (option: CityOption) => void;
  /** Suggestions to match against; `undefined` while not (yet) loaded. */
  options?: ReadonlyArray<CityOption>;
  /** Fires on every focus — lets the consumer load `options` lazily. */
  onFocus?: () => void;
  placeholder?: string;
  'aria-label'?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
};

const MAX_SUGGESTIONS = 8;

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const findMatches = (options: ReadonlyArray<CityOption>, query: string) => {
  const q = normalize(query);
  if (!q) return [];
  const prefix: CityOption[] = [];
  const contains: CityOption[] = [];
  for (const option of options) {
    const name = normalize(option.name);
    if (name.startsWith(q)) prefix.push(option);
    else if (name.includes(q)) contains.push(option);
  }
  const byName = (a: CityOption, b: CityOption) => a.name.localeCompare(b.name);
  return [...prefix.sort(byName), ...contains.sort(byName)].slice(0, MAX_SUGGESTIONS);
};

/**
 * Free-text input with city suggestions (ARIA 1.2 combobox). The value is
 * never restricted to a suggestion; picking one calls `onSelect` so the
 * consumer can also fill the country.
 */
export function CityAutocompleteInput({
  value,
  onChange,
  onSelect,
  options,
  onFocus,
  placeholder,
  'aria-label': ariaLabel,
  id,
  disabled = false,
  className,
}: CityAutocompleteInputProps) {
  const listId = useId();
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);

  const matches = options ? findMatches(options, value) : [];
  const open = focused && !dismissed && !disabled && matches.length > 0;
  const activeOption = open && activeIndex >= 0 ? matches[activeIndex] : undefined;

  const select = (option: CityOption) => {
    onSelect(option);
    setDismissed(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        if (matches.length === 0) return;
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setDismissed(false);
        setActiveIndex(
          open ? (activeIndex + step + matches.length) % matches.length : step === 1 ? 0 : matches.length - 1
        );
        break;
      }
      case 'Enter':
        if (activeOption) {
          event.preventDefault();
          select(activeOption);
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          setDismissed(true);
          setActiveIndex(-1);
        }
        break;
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={next => {
        if (!next) setDismissed(true);
      }}
    >
      <PopoverAnchor asChild={true}>
        <Input
          id={id}
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setDismissed(false);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={disabled}
          className={className}
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={activeOption ? `${listId}-${activeIndex}` : undefined}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-56 p-1"
        onOpenAutoFocus={e => e.preventDefault()}
        onCloseAutoFocus={e => e.preventDefault()}
      >
        <div id={listId} role="listbox" aria-label={ariaLabel} className="flex max-h-64 flex-col overflow-y-auto">
          {matches.map((option, index) => (
            <button
              key={option.id}
              id={`${listId}-${index}`}
              type="button"
              role="option"
              // Focus stays in the combobox input (aria-activedescendant pattern).
              tabIndex={-1}
              aria-selected={index === activeIndex}
              className={cn(
                'flex w-full items-baseline justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-control hover:bg-accent hover:text-accent-foreground',
                index === activeIndex && 'bg-accent text-accent-foreground'
              )}
              onMouseDown={e => e.preventDefault()}
              onClick={() => select(option)}
            >
              <span className="truncate">{option.name}</span>
              <span className="shrink-0 text-caption text-muted-foreground">{option.countryName}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
