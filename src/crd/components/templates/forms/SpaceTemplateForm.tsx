import { Check, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';
import { SpaceTemplatePreview } from '../preview/SpaceTemplatePreview';
import type { SpaceTemplateFormProps } from '../types';

export function SpaceTemplateForm({
  value,
  errors,
  onChange,
  searchResults,
  searchValue,
  onSearchChange,
  searchLoading,
  capturedStructure,
}: SpaceTemplateFormProps) {
  const { t } = useTranslation('crd-templates');

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('form.space.source')}</Label>
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={t('form.space.searchPlaceholder')}
            aria-label={t('form.space.searchPlaceholder')}
            className="pl-9"
            aria-invalid={Boolean(errors.sourceSpaceId)}
          />
        </div>
        {errors.sourceSpaceId && <p className="text-caption text-destructive">{errors.sourceSpaceId}</p>}
        {searchValue.trim().length > 0 && (
          <ul className="border rounded-md divide-y max-h-64 overflow-y-auto">
            {searchLoading ? (
              <li className="px-3 py-2 text-body text-muted-foreground">…</li>
            ) : searchResults.length === 0 ? (
              <li className="px-3 py-2 text-body text-muted-foreground">{t('form.space.noResults')}</li>
            ) : (
              searchResults.map(result => {
                const selected = result.id === value.sourceSpaceId;
                return (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => onChange({ ...value, sourceSpaceId: result.id })}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-control hover:bg-accent outline-none focus-visible:bg-accent"
                      aria-pressed={selected}
                    >
                      <Avatar className="size-6">
                        {result.avatarUrl && <AvatarImage src={result.avatarUrl} alt="" />}
                        <AvatarFallback>{result.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate">{result.name}</span>
                      {selected && <Check aria-hidden="true" className="size-4 text-primary" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="space-recursive" className="cursor-pointer">
          {t('form.space.recursive')}
        </Label>
        <Switch
          id="space-recursive"
          checked={value.recursive}
          onCheckedChange={recursive => onChange({ ...value, recursive })}
        />
      </div>

      {capturedStructure && (
        <div className="space-y-1.5">
          <Label>{t('form.space.capturedStructure')}</Label>
          <div className="border rounded-md p-3 bg-muted/20">
            <SpaceTemplatePreview content={capturedStructure} />
          </div>
        </div>
      )}
    </div>
  );
}
