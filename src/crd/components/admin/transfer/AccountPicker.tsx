import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SearchField } from '@/crd/forms/SearchField';
import { cn } from '@/crd/lib/utils';

export type AccountPickerOption = { id: string; name: string };

type AccountPickerProps = {
  label: string;
  searchTerm: string;
  onSearch: (term: string) => void;
  results: AccountPickerOption[];
  loading: boolean;
  selectedId?: string;
  onSelect: (accountId: string) => void;
};

/**
 * Target-account picker for transfers — search users + organizations (resolved
 * by the integration layer's `useAccountSearch`) and pick one as the transfer
 * target. Pure presentation.
 */
export function AccountPicker({
  label,
  searchTerm,
  onSearch,
  results,
  loading,
  selectedId,
  onSelect,
}: AccountPickerProps) {
  const { t } = useTranslation('crd-admin');

  return (
    <div className="flex flex-col gap-2">
      <span className="text-body-emphasis">{label}</span>
      <SearchField value={searchTerm} onValueChange={onSearch} placeholder={t('transfer.accountSearchPlaceholder')} />
      {searchTerm.length >= 2 && (
        <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
          {loading && <li className="text-caption text-muted-foreground">{t('roleMembers.loading')}</li>}
          {!loading && results.length === 0 && (
            <li className="text-caption text-muted-foreground">{t('transfer.noAccounts')}</li>
          )}
          {!loading &&
            results.map(option => (
              <li key={option.id}>
                <button
                  type="button"
                  aria-pressed={option.id === selectedId}
                  onClick={() => onSelect(option.id)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-body',
                    'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring outline-none',
                    option.id === selectedId && 'bg-accent'
                  )}
                >
                  {option.name}
                  {option.id === selectedId && <Check aria-hidden="true" className="size-4 text-primary" />}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
