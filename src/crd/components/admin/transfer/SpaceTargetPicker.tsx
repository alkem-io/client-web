import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchField } from '@/crd/forms/SearchField';
import { cn } from '@/crd/lib/utils';

export type SpaceTargetPickerItem = { id: string; displayName: string };

type SpaceTargetPickerProps = {
  items: SpaceTargetPickerItem[];
  value: string;
  onValueChange: (id: string) => void;
  excludeIds?: string[];
  placeholder: string;
  emptyLabel: string;
  loading: boolean;
  disabled?: boolean;
};

/**
 * Thin, searchable, bounded flat space picker for admin move operations.
 * Receives a pre-fetched bounded page of items; all filtering is client-side
 * (FR-010 — no new server search surface).
 */
export function SpaceTargetPicker({
  items,
  value,
  onValueChange,
  excludeIds = [],
  placeholder,
  emptyLabel,
  loading,
  disabled = false,
}: SpaceTargetPickerProps) {
  const { t } = useTranslation('crd-admin');
  const [search, setSearch] = useState('');

  const filtered = items.filter(
    item => !excludeIds.includes(item.id) && item.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2">
      <SearchField value={search} onValueChange={setSearch} placeholder={placeholder} ariaLabel={placeholder} />
      {/* biome-ignore lint/a11y/useSemanticElements: role="group" is correct here — children are aria-pressed toggle buttons, not form controls. <fieldset> is for form-control grouping and is not a valid substitute for a button-group container. */}
      <div
        role="group"
        aria-label={placeholder}
        className="flex max-h-48 flex-col gap-0.5 overflow-y-auto rounded-lg border border-border bg-background p-1"
      >
        {loading && (
          <output aria-label={t('roleMembers.loading')} className="block px-2 py-1 text-caption text-muted-foreground">
            {t('roleMembers.loading')}
          </output>
        )}
        {!loading && filtered.length === 0 && (
          <p className="px-2 py-1 text-caption text-muted-foreground">{emptyLabel}</p>
        )}
        {!loading &&
          filtered.map(item => (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              aria-pressed={item.id === value}
              onClick={() => onValueChange(item.id)}
              className={cn(
                'flex w-full items-center rounded-md px-2 py-1 text-left text-body transition-colors',
                'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring outline-none',
                item.id === value && 'bg-accent font-medium',
                disabled && 'pointer-events-none opacity-50'
              )}
            >
              {item.displayName}
            </button>
          ))}
      </div>
    </div>
  );
}
