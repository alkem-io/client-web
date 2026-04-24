import { FileText, Image as ImageIcon, Info, Layers, Link2, ListChecks, Loader2, Save, StickyNote } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/crd/primitives/accordion';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Checkbox } from '@/crd/primitives/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Separator } from '@/crd/primitives/separator';

export type SaveAsTemplateFormValues = {
  displayName: string;
  description: string;
  tags: string[];
  recursive: boolean;
};

export type SaveAsTemplateFieldErrors = Partial<Record<keyof SaveAsTemplateFormValues, string | undefined>>;

export type SaveAsTemplatePreviewState = {
  displayName: string;
  description?: string | null;
};

/**
 * Matches the GraphQL enum values to avoid dragging the enum into the CRD
 * layer (CRD must not import from `@/core/apollo`). Consumers map their
 * generated types to these string literals.
 */
export type SaveAsTemplateCalloutFramingType =
  | 'NONE'
  | 'MEMO'
  | 'WHITEBOARD'
  | 'LINK'
  | 'MEDIA_GALLERY'
  | 'POLL'
  | 'COLLABORA_DOCUMENT';

export type SaveAsTemplateCalloutContributionType = 'LINK' | 'POST' | 'MEMO' | 'WHITEBOARD' | 'COLLABORA_DOCUMENT';

export type SaveAsTemplatePreviewCallout = {
  id: string;
  displayName: string;
  description?: string | null;
  framingType: SaveAsTemplateCalloutFramingType;
  allowedContributionTypes: SaveAsTemplateCalloutContributionType[];
  flowStateDisplayName?: string | null;
  sortOrder: number;
};

export type SaveAsTemplatePreviewSubspace = { id: string; displayName: string };

export type SaveAsTemplatePreview = {
  states: SaveAsTemplatePreviewState[];
  callouts: SaveAsTemplatePreviewCallout[];
  subspaces: SaveAsTemplatePreviewSubspace[];
};

export type SaveAsTemplateUrlLoaderState = {
  open: boolean;
  url: string;
  error?: string;
  resolving: boolean;
};

export type SaveSubspaceAsTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Name of the subspace the action was triggered from. */
  subspaceName: string;
  /** Name of the space currently being used as the template's content source. */
  activeSpaceName: string;
  values: SaveAsTemplateFormValues;
  errors: SaveAsTemplateFieldErrors;
  submitting: boolean;
  canSubmit: boolean;
  preview: SaveAsTemplatePreview;
  previewLoading: boolean;
  urlLoader: SaveAsTemplateUrlLoaderState;
  onChange: (patch: Partial<SaveAsTemplateFormValues>) => void;
  onSubmit: () => void;
  onOpenUrlLoader: () => void;
  onCloseUrlLoader: () => void;
  onUrlChange: (next: string) => void;
  onUseUrl: () => void;
};

export function SaveSubspaceAsTemplateDialog({
  open,
  onOpenChange,
  subspaceName,
  activeSpaceName,
  values,
  errors,
  submitting,
  canSubmit,
  preview,
  previewLoading,
  urlLoader,
  onChange,
  onSubmit,
  onOpenUrlLoader,
  onCloseUrlLoader,
  onUrlChange,
  onUseUrl,
}: SaveSubspaceAsTemplateDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);

  useEffect(() => {
    const names = preview.states.map(s => s.displayName);
    if (names.length === 0) {
      if (selectedState !== undefined) setSelectedState(undefined);
      return;
    }
    if (!selectedState || !names.includes(selectedState)) {
      setSelectedState(names[0]);
    }
  }, [preview.states, selectedState]);

  const handleOpenChange = (next: boolean) => {
    if (submitting) return;
    onOpenChange(next);
  };

  const selectedStateDescription = preview.states.find(s => s.displayName === selectedState)?.description;
  const calloutsForSelectedState = preview.callouts
    .filter(c => (selectedState ? c.flowStateDisplayName === selectedState : !c.flowStateDisplayName))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const showContentSourceBanner = activeSpaceName && activeSpaceName !== subspaceName;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle>{t('subspaces.saveAsTemplate.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          {/* Profile section */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5">
              <h3 className="text-subsection-title">{t('subspaces.saveAsTemplate.profile.title')}</h3>
              <span
                className="inline-flex size-4 items-center justify-center rounded-full bg-muted text-muted-foreground"
                title={t('subspaces.saveAsTemplate.profile.help')}
              >
                <Info aria-hidden="true" className="size-3" />
              </span>
            </div>

            <Field
              id="save-template-name"
              label={t('subspaces.saveAsTemplate.fields.displayName')}
              required={true}
              error={errors.displayName}
            >
              <Input
                id="save-template-name"
                value={values.displayName}
                onChange={e => onChange({ displayName: e.target.value })}
                placeholder={t('subspaces.saveAsTemplate.fields.displayName')}
                disabled={submitting}
                aria-invalid={!!errors.displayName}
                className={errors.displayName ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
            </Field>

            <Field id="save-template-description" label={t('subspaces.saveAsTemplate.fields.description')}>
              <MarkdownEditor
                value={values.description}
                onChange={next => onChange({ description: next })}
                placeholder={t('subspaces.saveAsTemplate.fields.description')}
              />
            </Field>

            <Field id="save-template-tags" label={t('subspaces.saveAsTemplate.fields.tags')}>
              <TagsInput
                value={values.tags}
                onChange={next => onChange({ tags: next })}
                placeholder={t('subspaces.saveAsTemplate.fields.tagsPlaceholder')}
              />
            </Field>
          </section>

          <Separator />

          {/* Space Template section — content source + preview */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-subsection-title">{t('subspaces.saveAsTemplate.spaceTemplate.title')}</h3>
              {!urlLoader.open && (
                <Button type="button" variant="outline" size="sm" onClick={onOpenUrlLoader} disabled={submitting}>
                  {t('subspaces.saveAsTemplate.urlLoader.open')}
                </Button>
              )}
            </div>

            {showContentSourceBanner && (
              <p className="text-caption text-muted-foreground">
                {t('subspaces.saveAsTemplate.spaceTemplate.activeSource', { name: activeSpaceName })}
              </p>
            )}

            {urlLoader.open && (
              <div className="rounded-md border bg-muted p-4 flex flex-col gap-3">
                <p className="text-caption text-muted-foreground">
                  {t('subspaces.saveAsTemplate.urlLoader.description')}
                </p>
                <Input
                  value={urlLoader.url}
                  onChange={e => onUrlChange(e.target.value)}
                  placeholder={t('subspaces.saveAsTemplate.urlLoader.placeholder')}
                  disabled={urlLoader.resolving || submitting}
                  aria-invalid={!!urlLoader.error}
                  className={urlLoader.error ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {urlLoader.error && <p className="text-caption text-destructive">{urlLoader.error}</p>}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCloseUrlLoader}
                    disabled={urlLoader.resolving || submitting}
                  >
                    {t('subspaces.saveAsTemplate.urlLoader.cancel')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={onUseUrl}
                    disabled={urlLoader.resolving || submitting}
                    aria-busy={urlLoader.resolving}
                  >
                    {urlLoader.resolving ? (
                      <>
                        <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />
                        {t('subspaces.saveAsTemplate.urlLoader.resolving')}
                      </>
                    ) : (
                      t('subspaces.saveAsTemplate.urlLoader.use')
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Phases + preview */}
            {previewLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 aria-hidden="true" className="size-5 animate-spin" />
              </div>
            ) : preview.states.length > 0 ? (
              <div className="flex flex-col gap-3">
                <span className="text-label uppercase text-muted-foreground">
                  {t('subspaces.saveAsTemplate.preview.states')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {preview.states.map(state => {
                    const active = state.displayName === selectedState;
                    return (
                      <button
                        type="button"
                        key={state.displayName}
                        onClick={() => setSelectedState(state.displayName)}
                        className={
                          active
                            ? 'rounded-full border border-primary bg-primary text-primary-foreground px-3 py-1 text-caption'
                            : 'rounded-full border border-border bg-background text-foreground px-3 py-1 text-caption hover:bg-muted'
                        }
                      >
                        {state.displayName}
                      </button>
                    );
                  })}
                </div>

                {selectedStateDescription && (
                  <MarkdownContent content={selectedStateDescription} className="text-caption" />
                )}

                {/* Callouts accordion */}
                {calloutsForSelectedState.length > 0 ? (
                  <Accordion type="single" collapsible={true} className="flex flex-col gap-2">
                    {calloutsForSelectedState.map(callout => (
                      <AccordionItem
                        key={callout.id}
                        value={callout.id}
                        className="rounded-md border border-border bg-card [&:last-child]:border-b"
                      >
                        <AccordionTrigger className="px-3">
                          <span className="flex items-center gap-2">
                            <CalloutIcon
                              framingType={callout.framingType}
                              allowedContributionTypes={callout.allowedContributionTypes}
                            />
                            <span>{callout.displayName}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pt-0">
                          {callout.description?.trim() ? (
                            <MarkdownContent content={callout.description} />
                          ) : (
                            <p className="text-caption text-muted-foreground italic">
                              {t('subspaces.saveAsTemplate.preview.noCalloutDescription')}
                            </p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-caption text-muted-foreground italic">
                    {t('subspaces.saveAsTemplate.preview.noCalloutsInState')}
                  </p>
                )}
              </div>
            ) : null}

            {preview.subspaces.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-label uppercase text-muted-foreground">
                  {t('subspaces.saveAsTemplate.preview.subspaces')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {preview.subspaces.map(subspace => (
                    <Badge key={subspace.id} variant="secondary" className="text-caption">
                      {subspace.displayName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 text-caption text-muted-foreground">
              <Info aria-hidden="true" className="size-4 shrink-0 mt-0.5" />
              <p>{t('subspaces.saveAsTemplate.preview.info')}</p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="save-template-recursive"
                checked={values.recursive}
                onCheckedChange={next => onChange({ recursive: next === true })}
                disabled={submitting}
              />
              <Label htmlFor="save-template-recursive" className="text-body font-normal cursor-pointer">
                {t('subspaces.saveAsTemplate.recursive')}
              </Label>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={submitting}>
            {t('subspaces.saveAsTemplate.cancel')}
          </Button>
          <Button type="button" onClick={onSubmit} disabled={!canSubmit} aria-busy={submitting}>
            {submitting ? (
              <>
                <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />
                {t('subspaces.saveAsTemplate.saving')}
              </>
            ) : (
              <>
                <Save aria-hidden="true" className="mr-1.5 size-4" />
                {t('subspaces.saveAsTemplate.save')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className={error ? 'text-destructive' : undefined}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error ? <p className="text-caption text-destructive">{error}</p> : null}
    </div>
  );
}

function CalloutIcon({
  framingType,
  allowedContributionTypes,
}: {
  framingType: SaveAsTemplateCalloutFramingType;
  allowedContributionTypes: SaveAsTemplateCalloutContributionType[];
}) {
  // Mirrors `getCalloutIconBasedOnType` in the MUI callout icon module:
  // framing type wins; otherwise the first allowed contribution type;
  // otherwise a generic callout icon.
  if (framingType === 'MEMO') return <StickyNote aria-hidden="true" className="size-4 text-primary" />;
  if (framingType === 'WHITEBOARD') return <Layers aria-hidden="true" className="size-4 text-primary" />;
  if (framingType === 'LINK') return <Link2 aria-hidden="true" className="size-4 text-primary" />;
  if (framingType === 'MEDIA_GALLERY') return <ImageIcon aria-hidden="true" className="size-4 text-primary" />;
  if (framingType === 'POLL') return <ListChecks aria-hidden="true" className="size-4 text-primary" />;

  const first = allowedContributionTypes[0];
  if (first === 'LINK') return <Link2 aria-hidden="true" className="size-4 text-primary" />;
  if (first === 'MEMO') return <StickyNote aria-hidden="true" className="size-4 text-primary" />;
  if (first === 'WHITEBOARD') return <Layers aria-hidden="true" className="size-4 text-primary" />;

  return <FileText aria-hidden="true" className="size-4 text-primary" />;
}
