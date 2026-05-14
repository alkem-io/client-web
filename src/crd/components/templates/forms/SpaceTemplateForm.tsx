import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';
import { SpaceTemplatePreview } from '../preview/SpaceTemplatePreview';
import type { SpaceTemplateFormProps } from '../types';

/**
 * Presentational Space-template form. Mirrors the legacy MUI `SpaceContentFromSpaceUrlForm` UX:
 * paste a space URL → click "Use this space" → the integration layer resolves the URL, fetches the
 * space's innovation flow + callouts, and checks the user has Update privilege on the resolved space.
 *
 * All Apollo plumbing (URL resolver, space-content fetch, privilege check) lives in
 * `src/main/crdPages/templates/useTemplateForms.tsx`; this component is plain CRD presentational layer.
 */
export function SpaceTemplateForm({
  value,
  errors,
  onChange,
  url,
  onUrlChange,
  onUseUrl,
  urlResolving,
  urlError,
  sourceDisplayName,
  sourceAvatarUrl,
  capturedStructure,
}: SpaceTemplateFormProps) {
  const { t } = useTranslation('crd-templates');
  const hasSource = Boolean(value.sourceSpaceId);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('form.space.source')}</Label>

        {hasSource && (
          <div className="flex items-center justify-between gap-3 rounded-md border p-3">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="size-8">
                {sourceAvatarUrl && <AvatarImage src={sourceAvatarUrl} alt="" />}
                <AvatarFallback>{(sourceDisplayName ?? '?').charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="flex items-center gap-1 truncate text-control">
                  <Check aria-hidden="true" className="size-4 text-primary" />
                  {sourceDisplayName ?? value.sourceSpaceId}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onChange({ ...value, sourceSpaceId: undefined });
                onUrlChange('');
              }}
              disabled={urlResolving}
            >
              {t('form.space.urlLoader.selectAnother')}
            </Button>
          </div>
        )}

        {!hasSource && (
          <div className="space-y-2">
            <p className="text-caption text-muted-foreground">{t('form.space.urlLoader.description')}</p>
            <div className="flex items-start gap-2">
              <Input
                value={url}
                onChange={e => onUrlChange(e.target.value)}
                placeholder={t('form.space.urlLoader.placeholder')}
                aria-label={t('form.space.urlLoader.description')}
                aria-invalid={Boolean(urlError ?? errors.sourceSpaceId)}
                disabled={urlResolving}
                className="flex-1"
              />
              <Button type="button" onClick={onUseUrl} disabled={urlResolving || !url.trim()} aria-busy={urlResolving}>
                {urlResolving ? t('form.space.urlLoader.resolving') : t('form.space.urlLoader.use')}
              </Button>
            </div>
            {(urlError || errors.sourceSpaceId) && (
              <p className="text-caption text-destructive">{urlError ?? errors.sourceSpaceId}</p>
            )}
          </div>
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
